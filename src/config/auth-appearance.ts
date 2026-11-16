export const authAppearance = {
  variables: {
    colorPrimary: "#242424",
    colorPrimaryForeground: "#ffffff",
    colorText: "#242424",
    colorTextSecondary: "#71697a",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#242424",
    colorDanger: "#be123c",
    borderRadius: "0.75rem",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "w-full border-0 shadow-none bg-card p-0",
    headerTitle: "text-2xl font-semibold tracking-tight text-foreground",
    headerSubtitle: "text-sm text-dim",
    formButtonPrimary:
      "!bg-primary !text-primary-foreground hover:!bg-primary/85 hover:!text-primary-foreground rounded-lg py-3 text-sm shadow-none transition-colors active:scale-[.98]",
    formFieldInput:
      "rounded-lg border border-border bg-card px-3 py-3 text-sm focus:ring-2 focus:ring-dimgrey/30",
    formFieldLabel: "text-sm font-medium text-foreground",
    footerActionLink: "text-foreground font-medium hover:underline",
    dividerText: "text-xs text-dim",
    socialButtonsBlockButton: "!h-11 rounded-lg !border-border !bg-card !text-foreground hover:!bg-muted hover:!text-foreground text-sm shadow-none",
    socialButtonsProviderIcon: "!size-4 object-contain overflow-hidden",
    socialButtonsBlockButtonText: "!text-foreground",
    footer: "bg-card",
  },
};

export function getAuthAppearance(theme: "light" | "dark") {
  return theme === "light" ? authAppearance : {
    ...authAppearance,
    variables: {
      ...authAppearance.variables,
      colorPrimary: "#dde5d0",
      colorPrimaryForeground: "#1b221e",
      colorText: "#f2f2ee",
      colorTextSecondary: "#abb0a7",
      colorBackground: "#1f2321",
      colorInputBackground: "#1f2321",
      colorInputText: "#f2f2ee",
      colorDanger: "#f29bb0",
    },
  };
}
