import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createAppointment,
  listAppointmentsByUser,
} from "@/lib/booking/appointments-store";
import { getDoctorById, formatDoctorName } from "@/lib/booking/doctors";
import { getServiceById } from "@/lib/booking/services";
import { getSlotsForDay, isSlotInPast } from "@/lib/booking/slots";
import { z } from "zod";

const createSchema = z.object({
  doctorId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  note: z.string().max(1000).optional().default(""),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await listAppointmentsByUser(session.user.id);
  return NextResponse.json({ appointments: items });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
        { status: 400 }
      );
    }

    const { doctorId, serviceId, date, time, note } = parsed.data;
    const doctor = getDoctorById(doctorId);
    const service = getServiceById(serviceId);

    if (!doctor || !service) {
      return NextResponse.json(
        { error: "Nie znaleziono lekarza lub usługi" },
        { status: 400 }
      );
    }

    if (isSlotInPast(date, time)) {
      return NextResponse.json(
        { error: "Wybrany termin jest w przeszłości" },
        { status: 400 }
      );
    }

    const slots = getSlotsForDay(doctorId, date);
    const slot = slots.find((s) => s.time === time);
    if (!slot?.available) {
      return NextResponse.json(
        { error: "Wybrany termin jest już zajęty" },
        { status: 409 }
      );
    }

    const appointment = await createAppointment({
      userId: session.user.id,
      patientFirstName: session.user.firstName,
      patientLastName: session.user.lastName,
      patientEmail: session.user.email ?? "",
      patientPhone: session.user.phone,
      doctorId: doctor.id,
      doctorName: formatDoctorName(doctor),
      serviceId: service.id,
      serviceName: service.name,
      pricePln: service.pricePln,
      date,
      time,
      note: note.trim(),
      status: "confirmed",
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Nie udało się zapisać rezerwacji" },
      { status: 500 }
    );
  }
}
