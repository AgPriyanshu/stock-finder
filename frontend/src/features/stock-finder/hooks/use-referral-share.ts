import { useReferralCode } from "api/auth";
import { toaster } from "design-system/toaster/toaster-instance";

const buildWhatsAppMessage = (link: string) =>
  `Hey! I use *Stock Finder* to list my shop inventory and get buyer leads. Join me — the more shop owners we have, the more customers discover all of us! 🚀\n\nSign up here: ${link}`;

export const useReferralShare = () => {
  const { data: referral, isLoading } = useReferralCode();

  const referralLink = referral
    ? `${window.location.origin}/register?ref=${referral.code}`
    : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toaster.success({ title: "Link copied!" });
    } catch {
      toaster.error({ title: "Could not copy. Try manually." });
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(buildWhatsAppMessage(referralLink));
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return { referral, referralLink, isLoading, copyLink, shareOnWhatsApp };
};
