"use client";

import React from "react";
import { useServerInsertedHTML } from "next/navigation";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, App as AntApp } from "antd";
import { themeTokens } from "./theme";

/**
 * Registers AntDesign's CSS-in-JS cache so styles generated during SSR are
 * flushed into the initial HTML response (required for App Router — without
 * this, AntD styles flash unstyled on first paint).
 */
export default function AntdRegistry({ children }: { children: React.ReactNode }) {
  const cache = React.useMemo(() => createCache(), []);

  useServerInsertedHTML(() => (
    <style
      id="antd-cssinjs"
      dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
    />
  ));

  return (
    <StyleProvider cache={cache}>
      <ConfigProvider theme={themeTokens}>
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </StyleProvider>
  );
}
