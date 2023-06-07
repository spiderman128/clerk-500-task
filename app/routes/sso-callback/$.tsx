import { AuthenticateWithRedirectCallback } from "@clerk/remix";

function SSOCallback() {
    return <AuthenticateWithRedirectCallback />;
}

export default SSOCallback