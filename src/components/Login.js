import React, {useEffect, useState} from "react";
import {useActor} from "@xstate/react";
import {Button, Form, Input, Alert, Row, Card, Divider, Descriptions, notification, Spin} from "antd";
import getAllConfig from '../config/main'
import {XAuth} from "../services/XAuth";

export const Login = ({actor}) => {
    const [actorState, sendActor] = useActor(actor);
    const [parentState, sendParent] = useActor(actor.parent);
    const [spinning, setSpinning] = useState(false);

    const [loginForm] = Form.useForm();

    useEffect(() => {
        actor.subscribe(state => {
            state.matches("success") && sendParent("NAV_HOME");
        });
    }, []);

    const [authState, setAuthState] = useState("login");
    const [resetToken, setResetToken] = useState('');

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
                {authState == "forgot" ? <Spin spinning={spinning} size={"large"}>
                    <Form form={loginForm} size="large">
                        <Form.Item name="loginId">
                            <Input placeholder="User ID"/>
                        </Form.Item>
                        <Form.Item style={{margin: 0}}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                onClick={() => loginForm.validateFields()
                                    .then(_ => setSpinning(true) || XAuth.getPasswordResetToken(loginForm.getFieldsValue()))
                                    .then(data => {
                                        setSpinning(false);
                                        setResetToken(data.token);
                                        notification.success({
                                            key: `otp_${Date.now()}`,
                                            message: "OTP send to number",
                                            description: <>{data.otpInbox}</>,
                                            duration: 5
                                        });
                                        setAuthState("reset");
                                        // console.log(data);
                                    })
                                    .catch(error => {
                                        console.log(error);
                                        notification.error({
                                            key: `otp_${Date.now()}`,
                                            message: "Task Failed",
                                            description: <>{error.message}</>,
                                            duration: 5
                                        });
                                        setSpinning(false);
                                    })
                                }
                                children={"Submit"}
                            />
                        </Form.Item>
                    </Form> </Spin>: null}
                    {authState == "reset" ? <Form form={loginForm} size="large" initialValues={{newPassword: "", otp: "", confirmPassword: ""}}>
                        <Form.Item name="otp" required>
                            <Input placeholder="OTP"/>
                        </Form.Item>
                        <Form.Item name="token" initialValue={resetToken} hidden>
                            <Input placeholder="token"/>
                        </Form.Item>
                        <Form.Item name="password"
                                   rules={[{required: true},
                                       {
                                           message: 'Password should contain at least a upper case,Lower case, symbol like (@$!%*#?&) & min length 8.',
                                           validator: (_, value) => {
                                               if (/^^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/.test(value)) {
                                                   return Promise.resolve();
                                               } else {
                                                   return Promise.reject('Password should contain at least a upper case,Lower case, symbol like (@$!%*#?&) & min length 8.');
                                               }
                                           }
                                       }
                                   ]}
                        >
                            <Input placeholder="New Password" type={"password"}/>
                        </Form.Item>
                        <Form.Item name="confirmPassword" dependencies={['password']} hasFeedback
                            rules={[
                                ({getFieldValue}) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Passwords does not match!"));
                                    },
                                })
                            ]}
                        >
                            <Input.Password placeholder="Confirm Password"/>
                        </Form.Item>
                        <Form.Item style={{margin: 0}}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                onClick={() => loginForm.validateFields()
                                    .then(_ => XAuth.resetPassword(loginForm.getFieldsValue()))
                                    .then(data => {
                                        console.log(data);
                                        window.location.reload();
                                    })
                                    .catch(error => {
                                        console.log(error);
                                        notification.error({
                                            key: `reset_${Date.now()}`,
                                            message: "Task Failed",
                                            description: <>{error.message}</>,
                                            duration: 5
                                        });
                                    })
                                }
                                children={"Submit"}
                            />
                        </Form.Item>
                    </Form> : null}
                    {actorState.matches("error") && <Alert type="error" message={actorState.context.error}/>}
                </Card>
                    </Row>
                    );
                };
