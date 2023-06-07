import type { DataFunctionArgs, MetaFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { ClerkApp, ClerkCatchBoundary } from "@clerk/remix";
import {
  RemixRootDefaultCatchBoundary,
  RemixRootDefaultErrorBoundary,
} from "@remix-run/react/dist/errorBoundaries";
import Header from "~/components/Header";
import styles from "~/styles/shared.css";

export const meta: MetaFunction = () => {
  return { title: "New Remix App" };
};

export const links = () => {
  return [
    { rel: "stylesheet", href: "https://unpkg.com/modern-css-reset@1.4.0/dist/reset.min.css" },
    { rel: "stylesheet", href: styles },
  ];
}

export const CatchBoundary = ClerkCatchBoundary();

export const loader = (args: DataFunctionArgs) => {
  return rootAuthLoader(
    args,
    ({ request }) => {
      const { userId, sessionId, getToken } = request.auth;
      console.log("Root loader auth:", { userId, sessionId, getToken });
      return { message: `Hello from the root loader :)` };
    },
    { loadUser: true }
  );
};

function App() {
  const { message } = useLoaderData<typeof loader>();
  console.log(message)
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export const ErrorBoundary = () => {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    const { __clerk_ssr_interstitial_html } = error?.data?.clerkState?.__internal_clerk_state || {};
    console.log(__clerk_ssr_interstitial_html)
    if (__clerk_ssr_interstitial_html) {
      return <html dangerouslySetInnerHTML={{ __html: __clerk_ssr_interstitial_html }} />;
    }
    //  Current CatchBoundary Component
    return <RemixRootDefaultCatchBoundary />;
  } else if (error instanceof Error) {
    return <RemixRootDefaultErrorBoundary error={error} />;
  } else {
    let errorString =
      error == null
        ? "Unknown Error"
        : typeof error === "object" && "toString" in error
        ? error.toString()
        : JSON.stringify(error);
    return <RemixRootDefaultErrorBoundary error={new Error(errorString)} />;
  }
};

export default ClerkApp(App);