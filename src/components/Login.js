import { useEffect } from "react";
import { useActor } from "@xstate/react";
import { Button, Form, Input, Alert, Row, Card, Divider } from "antd";


export const Login = ({ actor }) => {
    const [actorState, sendActor] = useActor(actor);
    const [parentState, sendParent] = useActor(actor.parent);

    const [loginForm] = Form.useForm();

    useEffect(() => {
        actor.subscribe(state => {
            state.matches("success") && sendParent("NAV_HOME");
        });
    }, []);

    return (
        <Row type="flex" justify="center" align="middle" style={{ minHeight: '100vh' }}>
            <Card style={{width: "300px"}}>
                <img height={120} src="/logo.png" style={{display: "block",margin: "0 auto"}}/>
                <Divider style={{marginTop: 0}}>Client Login</Divider>
                <Form form={loginForm} size="large">
                    <Form.Item name="loginId">
                        <Input placeholder="User ID"/>
                    </Form.Item>
                    <Form.Item name="password">
                        <Input placeholder="Password" type={"password"} />
                    </Form.Item>

                    <Form.Item style={{margin: 0}}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            onClick={() => sendActor({ type: "SUBMIT", data: loginForm.getFieldsValue() })}
                            children={"Submit"}
                        />
                    </Form.Item>
                </Form>
                {actorState.matches("error") && <Alert type="error" message={actorState.context.error} />}
            </Card>
        </Row>
    );
};
