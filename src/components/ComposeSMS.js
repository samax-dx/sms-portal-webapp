import { Button, Card, Form, Input, Space, Select, Tag, Tooltip, Checkbox, Modal } from "antd";
import { FileDoneOutlined, FileTextOutlined } from "@ant-design/icons";
import { countries } from "countries-list";


export const ComposeSMS = props => {
    const [form] = Form.useForm();

    const sendSMS = async () => {
        const url = "https://localhost:8443/ofbiz-spring/api/SmsTask/sendSMS";
        const payload = form.getFieldsValue();

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        alert(JSON.stringify(await response.json()));
    };

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
                    <Button type="primary" onClick={sendSMS}>Send</Button>
                </Space>
            </Form>
        </Card>
    </>)
};

// const toSmsFormData = data => {
//     data["MobileNumbers"] = data["MobileNumbers"].join("\n");
//     return data;
// };

// const toSmsPostData = data => {
//     data["MobileNumbers"] = data["MobileNumbers"].split(/\r?\n/g);
//     return data;
// };

// const toRequest = req => {
//     req = Object.assign({
//         senderId: null,
//         isUnicode: true,
//         isFlash: false,
//         schedTime: null,
//         groupId: null,
//         Message: null,
//         contacts: null,
//         serviceId: null,
//         coRelator: null,
//         linkId: null,
//         principleEntityId: null,
//         templateId: null,
//     }, req);

//     const defaultFilter = v => v;
//     const contactsFilter = v => v && v.trim().replace(/[+\ \r]/gm, "");

//     [
//         ["isUnicode", "Is_Unicode"],
//         ["isFlash", "Is_Flash"],
//         ["contacts", "MobileNumbers", contactsFilter],
//         ["senderId", "SenderId"],
//     ].forEach(item => {
//         const srcKey = item[0];
//         const dstKey = item[1];
//         const valueFilter = item[2] || defaultFilter;

//         req[dstKey] = valueFilter(req[srcKey]);
//         delete req[srcKey];
//     });

//     Object.keys(req).forEach(k => {
//         if (req[k] === null) delete req[k];
//     });

//     return req;
// };

// const toResponse = (res = {
//     errorCode: 0,
//     errorDescription: null,
//     data: null
// }) => res;
