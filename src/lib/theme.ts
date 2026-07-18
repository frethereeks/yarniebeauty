import type { ThemeConfig } from "antd";

/**
 * Maps Yarniebeauty's gold/black brand tokens onto AntDesign's theme API.
 * Applied globally via ConfigProvider so dashboard tables, forms, modals,
 * and buttons feel like the same product as the public site rather than
 * a bolted-on generic admin panel.
 */
export const themeTokens: ThemeConfig = {
  token: {
    colorPrimary: "#C9A227", // gold
    colorLink: "#9C7D1D",
    colorLinkHover: "#E3C567",
    colorSuccess: "#5B7553",
    colorWarning: "#AD7D2C",
    colorError: "#A1453A",
    colorInfo: "#3D3530",

    colorTextBase: "#171411",
    colorBgBase: "#FAF6EE",

    fontFamily:
      "var(--font-body), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

    borderRadius: 4,
    wireframe: false,

    colorBorder: "#E3D9C4",
    colorBorderSecondary: "#EFE8D8",
  },
  components: {
    Button: {
      colorPrimary: "#171411",
      colorPrimaryHover: "#3D3530",
      colorPrimaryActive: "#171411",
      primaryColor: "#FAF6EE",
      borderRadius: 2,
      controlHeight: 42,
      fontWeight: 600,
    },
    Input: {
      colorBorder: "#E3D9C4",
      borderRadius: 2,
      controlHeight: 42,
      activeBorderColor: "#C9A227",
      hoverBorderColor: "#C9A227",
    },
    Select: {
      borderRadius: 2,
      controlHeight: 42,
    },
    Table: {
      headerBg: "#171411",
      headerColor: "#FAF6EE",
      headerSortActiveBg: "#221D18",
      rowHoverBg: "#F1EAD9",
      borderColor: "#E3D9C4",
    },
    Menu: {
      itemSelectedBg: "#221D18",
      itemSelectedColor: "#E3C567",
      itemHoverColor: "#E3C567",
      darkItemBg: "#171411",
    },
    Card: {
      borderRadiusLG: 4,
      colorBorderSecondary: "#E3D9C4",
    },
    Tag: {
      borderRadiusSM: 2,
    },
    Modal: {
      borderRadiusLG: 4,
    },
    Tabs: {
      inkBarColor: "#C9A227",
      itemSelectedColor: "#171411",
      itemHoverColor: "#9C7D1D",
    },
    Steps: {
      colorPrimary: "#C9A227",
    },
  },
};
