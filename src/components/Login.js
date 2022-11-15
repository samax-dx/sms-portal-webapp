import {useEffect, useState} from "react";
import {useActor} from "@xstate/react";
import {Button, Form, Input, Alert, Row, Card, Divider, Descriptions} from "antd";
import getAllConfig from '../config/main'

export const Login = ({actor}) => {
    const [actorState, sendActor] = useActor(actor);
    const [parentState, sendParent] = useActor(actor.parent);

    const [loginForm] = Form.useForm();

    useEffect(() => {
        actor.subscribe(state => {
            state.matches("success") && sendParent("NAV_HOME");
        });
    }, []);

    const [authState, setAuthState] = useState("login");

    return (
        <Row type="flex" justify="center" align="middle" style={{minHeight: '100vh'}}>
            <Card style={{width: "300px"}}>
                <Divider style={{margin: 0, fontSize: 25}}>SMS Client Portal</Divider>
                <img height={120} src={getAllConfig.logo} style={{display: "block", margin: "0 auto"}}/>
                {authState == "login" ? <Divider style={{marginTop: 0}}>Client Login</Divider> : null}
                {authState == "forgot" ? <Divider style={{marginTop: 0}}>Reset Request</Divider> : null}
                {authState == "reset" ? <Divider style={{marginTop: 0}}>Reset Password</Divider> : null}
                {authState == "login" ? <Form form={loginForm} size="large">
                    <Form.Item name="loginId">
                        <Input placeholder="User ID"/>
                    </Form.Item>
                    <Form.Item name="password">
                        <Input placeholder="Password" type={"password"}/>
                    </Form.Item>

                    <Form.Item style={{margin: 0}}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            onClick={() => sendActor({type: "SUBMIT", data: loginForm.getFieldsValue()})}
                            children={"Submit"}
                        />
                        <Button
                            type="link"
                            onClick={() => setAuthState("forgot")}
                            children={"Forgot Password?"}
                        />
                    </Form.Item>
                </Form> : null}
                {authState == "forgot" ? <Form form={loginForm} size="large">
                    <Form.Item name="loginId">
                        <Input placeholder="User ID"/>
                    </Form.Item>
                    <Form.Item style={{margin: 0}}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            onClick={() => setAuthState("reset")}
                            children={"Submit"}
                        />
                    </Form.Item>
                </Form> : null}
                {authState == "reset" ? <Form form={loginForm} size="large">
                    <Form.Item name="otp">
                        <Input placeholder="OTP"/>
                    </Form.Item>
                    <Form.Item name="updatePassword">
                        <Input placeholder="New Password" type={"password"}/>
                    </Form.Item>
                    <Form.Item name="confirmPassword">
                        <Input placeholder="Confirm Password" type={"password"}/>
                    </Form.Item>
                    <Form.Item style={{margin: 0}}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            // onClick={() => sendActor({ type: "SUBMIT", data: loginForm.getFieldsValue() })}
                            children={"Submit"}
                        />
                    </Form.Item>
                </Form> : null}
                {actorState.matches("error") && <Alert type="error" message={actorState.context.error}/>}
            </Card>
        </Row>
    );
};
