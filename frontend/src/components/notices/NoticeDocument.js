"use client";

import Image from "next/image";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const displayDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
};

export default function NoticeDocument({ notice, onClose }) {
  const isDirector = notice.issuerRole === "director";
  const officeTitle = isDirector ? "Office of the Director" : "Office of the Chairman";
  const signerTitle = isDirector ? "Director" : "Chairman";
  const memoNumber = notice.noticeNumber?.split("/").slice(-3).join("/") || "";
  const noticeDate = displayDate(notice.date);
  const signatureImage = isDirector
    ? "/images/gmca-director-signature.png"
    : "/images/gmca-chairman-signature.png";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="notice-view-shell fixed inset-0 z-[100] overflow-auto bg-slate-100/95 px-3 py-4 backdrop-blur-sm sm:px-6 sm:py-6" role="dialog" aria-modal="true" aria-labelledby="notice-document-title">
      <div className="notice-view-controls sticky left-0 top-0 z-20 mx-auto mb-4 flex w-full max-w-[210mm] items-center gap-3 bg-slate-100/95 py-2 backdrop-blur-sm">
        <Button type="button" variant="outline" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
          Back to notices
        </Button>
      </div>

      <article id="notice-print-document" className="mx-auto min-h-[297mm] w-[210mm] min-w-[210mm] shrink-0 bg-white px-[22mm] py-[20mm] text-slate-900 shadow-xl print:min-h-0 print:w-[210mm] print:max-w-none print:px-[22mm] print:py-[20mm] print:shadow-none">
        <header className="grid grid-cols-[68px_1fr] items-center gap-4 border-b-2 border-slate-800 pb-5 sm:grid-cols-[84px_1fr]">
          <Image
            src="/images/gmca-notice-seal.jpeg"
            alt="Gayatri Mandir Cricket Association seal"
            width={640}
            height={640}
            className="h-[68px] w-[68px] object-contain sm:h-[84px] sm:w-[84px]"
            priority
          />
          <div className="text-center">
            <p className="text-lg font-black uppercase tracking-[0.12em] text-slate-800 sm:text-xl">{officeTitle}</p>
            <h1 className="mt-1 whitespace-nowrap text-[11px] font-bold uppercase leading-snug tracking-[-0.02em] sm:text-xs">Gayatri Mandir Cricket Association - Kalyan Mandap Cricket Association</h1>
            <p className="mt-1 text-[11px] text-slate-600 sm:text-xs">BDA Colony, Khordha, Pin - 752055</p>
          </div>
        </header>

        <div className="mt-7 flex flex-wrap justify-between gap-x-6 gap-y-2 text-sm">
          <p><span className="font-semibold">Letter No.:</span> {notice.noticeNumber}</p>
          <p><span className="font-semibold">Date:</span> {noticeDate}</p>
        </div>

        <h2 id="notice-document-title" className="my-8 text-center text-xl font-bold uppercase tracking-wide underline decoration-slate-300 underline-offset-4 sm:text-2xl">
          {notice.title}
        </h2>
        <div className="min-h-40 whitespace-pre-wrap text-[15px] leading-8 text-slate-800">{notice.description}</div>

        <footer className="mt-14 ml-auto w-56 text-right">
          <p className="text-sm font-semibold">By the Order,</p>
          <Image
            src={signatureImage}
            alt={`${signerTitle} signature`}
            width={164}
            height={100}
            className="ml-auto mt-2 h-20 w-36 object-contain object-right"
          />
          <p className="mt-1 text-sm font-semibold">{signerTitle}</p>
          <p className="text-sm">GMCA-KMCA</p>
        </footer>

        {isDirector && (
          <section className="mt-12 border-t border-slate-200 pt-6">
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">Memo No.</span> {memoNumber} / GMCA-KMCA, dated {noticeDate}
            </p>
            <h3 className="mt-6 text-sm font-bold">Copy to:</h3>
            <p className="mt-2 text-sm leading-relaxed">
              1. The Chairman, GMCA-KMCA for kind information.
            </p>
            <div className="mt-8 ml-auto w-56 text-right">
              <Image
                src={signatureImage}
                alt="Director signature"
                width={164}
                height={100}
                className="ml-auto h-20 w-36 object-contain object-right"
              />
              <p className="mt-1 text-sm font-semibold">Director</p>
              <p className="text-sm">GMCA-KMCA</p>
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
