import { Button, Card, Form, Input, Space, Select, Tooltip, Checkbox } from "antd";
import { FileDoneOutlined, FileTextOutlined } from "@ant-design/icons";
import { countries } from "countries-list";
import { useActor } from "@xstate/react";
import { useEffect } from "react";


export const SendSMS = ({ actor }) => {
    const [form] = Form.useForm();

    const [gatewayState, sendGateway] = useActor(actor);
    const [parentState, sendParent] = useActor(actor.parent);

    useEffect(() => {
        actor.subscribe(state => {
            if (state.matches("idle") && (state.context.result || state.context.error)) {
                sendParent("NAV_SMS_REPORT");
            }
        });
    }, [])

    return (<>
        <Space><br /></Space>
        <Card style={{ maxWidth: "40vw" }}>
            <Form
                form={form}
                initialValues={{
                    CampaignName: null,
                    SenderId: "8809638010035",
                    MobileNumbers: "",
                    autoCountryCode: null,
                    Message: "",
                    Is_Unicode: true,
                    Is_Flash: false,
                }}
                layout="vertical"
            >
                <Form.Item
                    label="Campaign Name"
                    name="CampaignName"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Sender ID"
                    name="SenderId"
                >
                    <Input />
                </Form.Item>
                <Form.Item label="Contacts">
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Form.Item name="MobileNumbers" style={{ margin: 0 }}>
                            <Input.TextArea />
                        </Form.Item>
                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                            <Form.Item name="autoCountryCode" style={{ margin: 0 }}>
                                <Select
                                    showSearch
                                    style={{ width: 200 }}
                                    placeholder="Auto Country Code"
                                    onChange={_ => console.log("changed")}
                                    optionFilterProp="children"
                                    filterOption={true}
                                    allowClear={true}
                                >
                                    {
                                        Object.values(countries).map(({ name, emoji, phone }) => {
                                            return (
                                                <Select.Option value={phone} key={emoji}>
                                                    <Button type="link">{emoji}</Button> {name}
                                                </Select.Option>
                                            );
                                        })
                                    }
                                </Select>
                            </Form.Item>
                            <div>
                                Import Contacts:
                                <Button size="small" type="link">Groups</Button> |
                                <Button size="small" type="link">File (Excel, CSV, Text)</Button>
                            </div>
                        </Space>
                    </Space>
                </Form.Item>
                <Form.Item label="Message">
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                            <Space>
                                <Tooltip title="Import Draft"><Button shape="circle" icon={<FileTextOutlined />} /></Tooltip>
                                <Tooltip title="Import Template"><Button shape="circle" icon={<FileDoneOutlined />} /></Tooltip>
                            </Space>
                            <Space>
                                <Form.Item name="Is_Unicode" valuePropName="checked" style={{ margin: 0 }}>
                                    <Checkbox><Tooltip title="using unicode charecters">Unicode</Tooltip></Checkbox>
                                </Form.Item>
                                <Form.Item name="Is_Flash" valuePropName="checked" style={{ margin: 0 }}>
                                    <Checkbox><Tooltip title="is a flash sms">Flash</Tooltip></Checkbox>
                                </Form.Item>
                            </Space>
                        </Space>
                        <Form.Item name="Message" style={{ margin: 0 }}>
                            <Input.TextArea />
                        </Form.Item>
                        <span>Used: 0 | Left: 1224 | SMS Count: 0</span>
                    </Space>
                </Form.Item>
                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    <Button type="default">Draft</Button>
                    <Button type="default">Schedule</Button>
                    <Button
                        type="primary"
                        onClick={() => {
                            sendGateway({
                                type: "LOAD", data: form.getFieldsValue()
                            });
                        }}
                        children="Send"
                    />
                </Space>
            </Form>
        </Card>
    </>)
};
