import { useEffect } from "react";
import { useActor } from "@xstate/react";
import { Button, Form, Input, Alert, Row } from "antd";


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
            <div>
                <Form
                    form={loginForm}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                >
                    <Form.Item label="User ID" name="username">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Password" name="password">
                        <Input type={"password"} />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 18, span: 6 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            onClick={() => sendActor({ type: "SUBMIT", data: loginForm.getFieldsValue() })}
                            children={"Save"}
                        />
                    </Form.Item>
                </Form>
                {actorState.matches("error") && <Alert type="error" message={actorState.context.error} />}
            </div>
        </Row>
    );
};
