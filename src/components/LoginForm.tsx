import React, { ReactElement } from "react";
import { ONSPanel, StyledForm } from "blaise-design-system-react-components";
import { Component } from "react";
import { validatePassword, validateUserPermissions } from "../client/user";
import { AuthManager } from "../client/token";


type LoginFormProps = {
  authManager: AuthManager
  setLoggedIn: (loggedIn: boolean) => void
}

type LoginFormState = {
  error: string
}

export default class LoginForm extends Component<LoginFormProps, LoginFormState> {
  constructor(props: LoginFormProps) {
    super(props);
    this.login = this.login.bind(this);
    this.state = {
      error: ""
    };
  }

  formFields(): any {
    return [
      {
        name: "Username",
        id: "username",
        description: "Your Blaise username",
        type: "username",
      },
      {
        name: "Password",
        description: "Your Blaise password",
        type: "password",
      }
    ];
  }

  async login(form: Record<string, string>, setSubmitting: (isSubmitting: boolean) => void): Promise<void> {
    const valid = await validatePassword(form.Username, form.Password);
    if (!valid) {
      this.setState({
        error: "Incorrect username or password"
      });
      setSubmitting(false);
      return;
    }
    const [authorised, token] = await validateUserPermissions(form.Username);
    if (!authorised) {
      this.setState({
        error: "You do not have the correct permissions"
      });
      setSubmitting(false);
      return;
    }
    this.props.authManager.setToken(token);
    this.props.setLoggedIn(authorised);
  }

  error(): ReactElement | undefined {
    if (this.state.error != "") {
      return <ONSPanel status="error">{this.state.error}</ONSPanel>;
    }
    return undefined;
  }

  render(): ReactElement {
    return (
      <>
        <h1 className="u-mt-m">Sign in</h1>
        {this.error()}
        <StyledForm fields={this.formFields()} onSubmitFunction={this.login} submitLabel="Sign in" />
      </>
    );
  }
}
