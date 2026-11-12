declare const figma: {
  showUI(html: string, options: { width: number; height: number; title: string }): void;
  ui: {
    onmessage: (message: unknown) => void;
    postMessage(message: unknown): void;
  };
};
import html from "./ui.html";

type PingMessage = {
  type: "ping";
  requestId: string;
};

figma.showUI(html, {
  width: 360,
  height: 600,
  title: "Illustration Builder"
});

figma.ui.onmessage = (message: unknown) => {
  const candidate = message as Partial<PingMessage>;
  if (candidate.type === "ping" && typeof candidate.requestId === "string") {
    figma.ui.postMessage({ type: "pong", requestId: candidate.requestId });
  }
};
