// ** React Import
import { useState, FormEvent } from "react"

// ** Remix Import
import { useNavigate } from "@remix-run/react"
import { LinksFunction } from "@remix-run/react/dist/routeModules"

// ** Clerk Hook Import
import { useSignUp, useUser } from "@clerk/remix"

// ** Icon Import
import { EyeOff, Eye } from "react-feather"

// ** Third-party Component Import
import PhoneInput from 'react-phone-number-input'

// ** Styles Import
import styles from "~/styles/sign-up.css"
import phoneInputCSS from 'react-phone-number-input/style.css'

// Import styles
export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: phoneInputCSS }
]

export default function SignUpPage() {

  // Hook
  const { user } = useUser()
  const navigate = useNavigate()
  const { isLoaded, signUp, setActive } = useSignUp()

  // State
  const [errors, setErrors] = useState<any[]>([])
  const [userCreated, setUserCreated] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [phoneFocused, setPhoneFocused] = useState<boolean>(false)

  // Input State
  const [agree, setAgree] = useState<boolean>(false)
  const [username, setUserName] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [emailAddress, setEmailAddress] = useState<string>("")

  // Submit clerk basic sign-up form
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isLoaded) {
      return
    }

    if (!agree) {
      setErrors([{
        paramName: 'agree',
        message: 'You need to accept terms to submit.'
      }])
      return
    }

    try {
      const firstSpaceIndex = username.indexOf(" ");
      const firstName = firstSpaceIndex > -1 ? username.substring(0, firstSpaceIndex) : username;
      const lastName = firstSpaceIndex > -1 ? username.substring(firstSpaceIndex + 1) : "";
      await signUp.create({
        firstName,
        lastName,
        emailAddress,
        phoneNumber,
        password,
      })
      if (signUp.status === "complete") {
        setActive({ session: signUp.createdSessionId })
        setUserCreated(true)
      }
    } catch (err: any) {
      setErrors(err?.errors ?? [])
    }
  }

  // Submit clerk oauth sign-up form
  const attachGoogleAccount = () => {
    user
      ?.createExternalAccount({
        strategy: "oauth_google",
        redirectUrl: "/"
      })
      .then(async (externalAccount) => {
        const url = externalAccount.verification?.externalVerificationRedirectURL
        if (url) {
          window.location.replace(url)
        } else {
          alert('An unexpected error occured.')
        }
      })
      .catch((err) => {
        alert('An unexpected error occured.')
      })
  }

  // Get the message from field name
  const getErrorMessage = (fieldName: string) => {
    let error = errors.find(item => (item.paramName || item.meta.paramName) === fieldName)?.message ?? null
    if (error === 'is invalid') {
      error = fieldName.split('_').join(' ') + ' is invalid'
      error = error.charAt(0).toUpperCase() + error.slice(1)
    }
    return error
  }

  // Navigate to home page
  const redirectHome = () => {
    navigate('/')
  }

  const renderBasicForm = () => {
    return (
      <div className="custom-section">
        <img src="/logo.jpg" height={30} />
        <h4 className="signup-description">Create your free AirChat account</h4>
        <hr />
        <form onSubmit={handleSubmit} className="signup-basic-form">
          {/* Input Full Name */}
          <div className="custom-form-item">
            <label htmlFor="userName">Full Name</label>
            <input 
              id="userName" 
              type="text" 
              value={username} 
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter Full Name"
            />
            <div className="err-msg">{getErrorMessage('first_name') ?? getErrorMessage('last_name')}</div>
          </div>
          {/* Input Email Address */}
          <div className="custom-form-item">
            <label htmlFor="userEmail">Email</label>
            <input 
              id="userEmail" 
              type="email" 
              value={emailAddress} 
              onChange={(e) => setEmailAddress(e.target.value)} 
              placeholder="Enter Email Address"
            />
            <div className="err-msg">{getErrorMessage('email_address')}</div>
          </div>
          {/* Input Phone Number */}
          <div className={`custom-form-item${phoneFocused ? ' focused' : ''}`}>
            <label htmlFor="userPhone">Phone</label>
            <PhoneInput
              placeholder="Enter Phone Number"
              onBlur={() => setPhoneFocused(false)}
              onFocus={() => setPhoneFocused(true)}
              value={phoneNumber}
              onChange={(v) => setPhoneNumber(v ?? '')}
            />
            <div className="err-msg">{getErrorMessage('phone_number')}</div>
          </div>
          {/* Input Password */}
          <div className="custom-form-item">
            <label htmlFor="userPassword">Password</label>
            <div className="input-password">
              <input 
                id="userPassword"
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
              />
              <div className="pwd-option" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </div>
            </div>
            <div className="err-msg">{getErrorMessage('password')}</div>
          </div>
          {/* Checkbox Terms and Condition */}
          <div className="agree_tnc">
            <input   
              id="checkTnC"
              type="checkbox"
              checked={agree} 
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label htmlFor="checkTnC">I agree to terms and conditions.</label>
          </div>
          <div className="err-msg">{getErrorMessage('agree')}</div>
          {/* Button Submit */}
          <button type="submit" className="btn-submit" disabled={!isLoaded}>
            Continue
          </button>
        </form>
      </div>
    )
  }

  const renderOAuthForm = () => {
    return (
      <div className="custom-section">
        <img src="/logo.jpg" height={30} />
        <h4 className="signup-description">Do you want to attach your Google account for an easier sign-in experience?</h4>
        <hr />
        <div className="signup-oauth-form">
          {/* BUTTON WITH GOOGLE */}
          <button className="btn-oauth" onClick={attachGoogleAccount}>
            <img src="/google_logo.png" width={20} className="g_logo" />
            Continue with Google
          </button>
          {/* BUTTON WITHOUT GOOGLE */}
          <button className="btn-continue" onClick={redirectHome}>
            No, thanks. Continue without Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {userCreated ? (
        renderOAuthForm()
      ) : (
        renderBasicForm()
      )}
    </div>
  )
}
