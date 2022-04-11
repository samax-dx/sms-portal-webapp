import { useActor } from "@xstate/react";
import { Button, Form, InputNumber, notification, Space, Typography } from "antd";
import { useEffect } from "react";
import { PaymentList } from "./PaymentList";

const { Text } = Typography;

export const CashDeposit = ({ actor: [listActor, depositActor] }) => {
    const [depositForm] = Form.useForm();

    const [listState, sendList] = useActor(listActor);
    const [depositState, sendDeposit] = useActor(depositActor);
    const [parentState, sendParent] = useActor(depositActor.parent);

    useEffect(() => {
        depositActor.subscribe(state => {
            const listState = listActor.getSnapshot();
            const depositState = depositActor.getSnapshot();

            if (state.matches("hasResult")) {
                const listPayload = listState.context.payload || { data: {} };
                Object.assign(listPayload.data, { orderBy: "date DESC" });
                sendList({ ...listPayload, type: "LOAD" });

                notification.success({
                    message: "Success",
                    description: <>
                        Deposit request sent.
                    </>,
                    duration: 3
                });
            }

            if (state.matches("hasError")) {
                notification.error({
                    message: "Error",
                    description: <>
                        Deposit request failed. [Error: {depositState.context.error.message}]
                    </>,
                    duration: 3
                });
            }
        });
    }, []);

    return (<>
        <PaymentList actor={listActor}>
            <Space direction="vertical" size={"large"}>
                <Text strong>Request Cash Deposit</Text>
                <Form
                    form={depositForm}
                    layout="inline"
                    noValidate={true}
                >
                    <Form.Item name={"amount"} rules={[{ required: true }]}>
                        <InputNumber placeholder="amount" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            onClick={() => depositForm
                                .validateFields()
                                .then(_ => sendDeposit({ type: "LOAD", data: depositForm.getFieldsValue() }))
                                .catch(_ => { })
                            }
                            children={"Submit"}
                        />
                    </Form.Item>
                </Form>
            </Space>
        </PaymentList>
    </>);
};
