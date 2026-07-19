import { Activity, Bone, Newspaper } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const services = [
  {
    id: "leczenie-ortopedyczne",
    title: "Leczenie ortopedyczne",
    description:
      "Diagnostyka i leczenie schorzeń narządu ruchu, leczenie operacyjne, terapie PRP oraz iniekcje z kwasu hialuronowego.",
    icon: Bone,
  },
  {
    id: "fizjoterapia",
    title: "Fizjoterapia i rehabilitacja",
    description:
      "Profesjonalna rehabilitacja po urazach i zabiegach. Indywidualne plany terapii wspierające powrót do sprawności.",
    icon: Activity,
  },
  {
    id: "aktualnosci",
    title: "Aktualności i baza wiedzy",
    description:
      "Nowości z placówki, porady medyczne oraz informacje o innowacyjnych metodach leczenia i rehabilitacji.",
    icon: Newspaper,
  },
] as const;

export function ServicesSection() {
  return (
    <section className="bg-white py-16 md:py-20" aria-labelledby="services-heading">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <h2
            id="services-heading"
            className="text-2xl font-bold uppercase tracking-wide text-brand-heading md:text-3xl"
          >
            Nasza oferta
          </h2>
          <div className="section-divider mt-3" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.id}
                id={service.id}
                className="scroll-mt-28 border-gray-100 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-secondary text-brand">
                    <Icon className="size-6" aria-hidden />
                  </div>
                  <CardTitle className="text-lg text-brand-heading">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-[15px] leading-relaxed text-muted-foreground">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
