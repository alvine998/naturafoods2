"use client";
import { motion } from "framer-motion";
import Image from "./SafeImage";
import { useLang } from "../i18n";
import { useStore } from "../lib/store";

export type ContactPerson = {
  region: string;
  name: string;
  title: string;
  whatsapp: string;
  email: string;
  avatar: string;
  gender?: string;
  sortIndex: number;
};

function ContactCard({
  contact,
  index,
}: {
  contact: ContactPerson;
  index: number;
}) {
  const prefix = contact.gender?.toLowerCase() === "female" ? "Ms." : "Mr.";
  const displayName = contact.name
    .replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, "")
    .trim();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col items-start gap-4 rounded-xl bg-white p-4 shadow-md min-[420px]:flex-row min-[420px]:items-center"
    >
      <Image
        src={contact.avatar}
        alt={contact.name}
        width={64}
        height={64}
        className="w-16 h-16 rounded-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[#2D4A22]">{contact.region}</p>
        <p className="text-sm font-semibold text-gray-800">
          {prefix} {displayName}
        </p>
        <p className="text-xs text-gray-500 mb-2">{contact.title}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          <a
            href={`https://wa.me/${contact.whatsapp.replace("+", "")}`}
            className="flex items-center gap-1 text-xs text-green-600 hover:underline"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Whatsapp
          </a>
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            E-mail
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function ContactInfoSection() {
  const { t } = useLang();
  const { salesContacts } = useStore();

  const contacts: ContactPerson[] = (salesContacts ?? [])
    .filter((c) => c.published !== false)
    .map((s) => ({
      region: String(s.location ?? ""),
      name: String(s.name ?? ""),
      title: String(s.position ?? ""),
      whatsapp: String(s.whatsapp ?? ""),
      email: String(s.email ?? ""),
      avatar: String(s.photo ?? ""),
      gender: String(s.gender ?? ""),
      sortIndex: Number(s.sortIndex ?? 0),
    }))
    .filter((c) => c.name && (c.whatsapp || c.email));

  if (!contacts.length) return null;
  return (
    <div className="mt-8">
      <h4 className="text-center text-xl font-semibold text-[#2D4A22] mb-6">
        {t.homeContactInfoTitle}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contacts.sort((a, b) => a.sortIndex - b.sortIndex).map((contact, index) => (
          <ContactCard key={contact.sortIndex} contact={contact} index={index} />
        ))}
      </div>
    </div>
  );
}
