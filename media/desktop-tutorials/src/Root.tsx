import React from "react";
import { Composition } from "remotion";
import {
  DesktopChatgptTutorial,
  desktopChatgptDuration,
} from "./DesktopChatgptTutorial";

export const Root: React.FC = () => (
  <>
    <Composition
      id="DesktopChatgptEn"
      component={() => <DesktopChatgptTutorial locale="en" />}
      durationInFrames={desktopChatgptDuration}
      fps={30}
      width={1280}
      height={720}
    />
    <Composition
      id="DesktopChatgptZh"
      component={() => <DesktopChatgptTutorial locale="zh" />}
      durationInFrames={desktopChatgptDuration}
      fps={30}
      width={1280}
      height={720}
    />
  </>
);
