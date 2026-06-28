import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeBlock({ language, code }: any) {
  return (
    <SyntaxHighlighter language={language} style={oneDark}>
      {code}
    </SyntaxHighlighter>
  );
}