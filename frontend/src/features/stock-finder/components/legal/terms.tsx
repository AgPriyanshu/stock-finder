import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Box } from "@chakra-ui/react";
import termsContent from "../../content/terms.md?raw";

const markdownStyles = {
  "& h1": { fontSize: "xl", fontWeight: 700, mb: 4 },
  "& h2": { fontSize: "lg", fontWeight: 600, mt: 6, mb: 2 },
  "& p": { mb: 3, lineHeight: 1.7 },
  "& ul, & ol": { paddingLeft: "1.5em", mb: 3 },
  "& li": { mb: 1 },
  "& strong": { fontWeight: 600 },
  "& a": { color: "intent.primary", textDecoration: "underline" },
};

export const TermsPage = () => (
  <Box
    className="terms-page"
    maxW="720px"
    mx="auto"
    px={6}
    py={8}
    pb={16}
    css={markdownStyles}
  >
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{termsContent}</ReactMarkdown>
  </Box>
);
