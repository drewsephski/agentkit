import { Composition, Folder } from "remotion";
import { AgentKitHeroVideo } from "./compositions/AgentKitHeroVideo";
import { AgentKitProductVideo } from "./compositions/AgentKitProductVideo";
import { AgentKitShort } from "./compositions/AgentKitShort";
import { ViralAgentKitShort } from "./compositions/ViralAgentKitShort";

export const RemotionRoot = () => {
  return (
    <>
      <Folder name="product-videos">
        <Composition
          id="AgentKitHeroVideo"
          component={AgentKitHeroVideo}
          durationInFrames={770}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            productName: "AgentKit",
            tagline: "Build AI agents in hours, not weeks",
          } as Record<string, unknown>}
        />
        <Composition
          id="AgentKitProductVideo"
          component={AgentKitProductVideo}
          durationInFrames={1800}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            productName: "AgentKit",
            tagline: "Build AI agents in hours, not weeks",
            primaryColor: "#10b981",
          } as Record<string, unknown>}
        />
        <Composition
          id="AgentKitShort"
          component={AgentKitShort}
          durationInFrames={600}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            productName: "AgentKit",
            tagline: "AI agents. Simplified.",
          } as Record<string, unknown>}
        />
        <Composition
          id="ViralAgentKitShort"
          component={ViralAgentKitShort}
          durationInFrames={315}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            productName: "AgentKit",
            tagline: "Build AI agents in hours, not weeks",
          } as Record<string, unknown>}
        />
      </Folder>
    </>
  );
};
