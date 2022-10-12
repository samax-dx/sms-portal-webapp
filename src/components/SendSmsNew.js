import {
    Button,
    Card,
    Typography,
    Form,
    Input,
    Text,
    Space,
    Tooltip,
    Checkbox,
    notification,
    Select,
    Upload,
    message,
    Spin
} from "antd";
import * as sheetjs from "xlsx";
import { FileTextTwoTone } from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import {SmsTaskService} from "../services/SmsTaskService";
import React, {useState} from "react";


export const SendSmsNew = () => {
    const [campaignForm] = Form.useForm();
    const [spinning, setSpinning] = useState(false);

    const { Title, Text } = Typography;
    const dataForm = (
        <Card style={{marginLeft:5}} title={<Title level={5}>Send SMS</Title>}
              headStyle={{backgroundColor:"#f0f2f5", border: 0,padding:'0px'}}>
            <Form
                form={campaignForm}
                initialValues={{ senderId: "8801552146283", isUnicode: true/*, campaignPackage: campaignPackages[0] ? campaignPackages[0].productId : null*/ }}
                layout="vertical"
                wrapperCol={{ span: 8 }}
            >
                <Form.Item name="senderId" label="Sender ID" rules={[{ required: true }]} children={<Input />} />

                <Form.Item
                    name="phoneNumbers"
                    label={<>
                        <span>Contacts</span>
                        &nbsp;
                        <Upload
                            maxCount={1}
                            accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
                            customRequest={r => {
                                const reader = new FileReader();

                                reader.onload = () => {
                                    const contactBook = sheetjs.read(reader.result, { sheets: 0 });
                                    const contactSheet = Object.values(contactBook.Sheets)[0];

                                    const contacts = sheetjs.utils
                                        .sheet_to_json(contactSheet, { skipHidden: true })
                                        .reduce((acc, v) => {
                                            if (v.msisdn !== undefined) {
                                                acc.push(v.msisdn);
                                            }
                                            return acc;
                                        }, []);

                                    contacts.length ? r.onSuccess(JSON.stringify(contacts)) : r.onError("zero_msisdn_found");
                                };

                                reader.onerror = () => {
                                    r.onError(reader.error.message);
                                }

                                reader.readAsArrayBuffer(r.file);
                            }}
                            onChange={info => {
                                if (info.file.status === 'done') {
                                    campaignForm.setFieldsValue({ ...campaignForm.getFieldsValue, phoneNumbers: info.file.response.join(", ") })
                                    return message.success(`Found ${info.file.response.length} MSISDN(s)`);
                                }
                                if (info.file.status === 'error') {
                                    return message.error(`Error: ${info.file.error.toUpperCase()}`);
                                }
                            }}
                            showUploadList={false}
                            children={<Button shape="round" icon={<FileTextTwoTone />} />}
                        />
                        {/* <Button type="link" onClick={() => console.log("Import Draft")}>
                            [ Import (Excel, CSV, Text) ]
                        </Button> */}
                    </>}
                    rules={[{ required: true }]}
                >
                    <Input.TextArea />
                </Form.Item>

                <Form.Item
                    name="message"
                    label={<>
                        <span>Message Text</span>
                        <span style={{ display: "none" }}>
                            &nbsp;
                            <Button type="link" onClick={() => console.log("Import Draft")}>
                                [ Import Draft ]
                            </Button>
                            &nbsp;
                            <Button type="link" onClick={() => console.log("Import Template")}>
                                [ Import Template ]
                            </Button>
                        </span>
                    </>}
                    rules={[{ required: true }]}
                >
                    <Input.TextArea />
                </Form.Item>

                <Form.Item>
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <span>SMS Count: ...</span>
                        <Space>
                            <Form.Item name="isUnicode" valuePropName="checked" style={{ margin: 0 }}>
                                <Checkbox><Tooltip title="using unicode charecters">Unicode</Tooltip></Checkbox>
                            </Form.Item>
                            <Form.Item name="isFlash" valuePropName="checked" style={{ margin: 0 }}>
                                <Checkbox><Tooltip title="is a flash sms">Flash</Tooltip></Checkbox>
                            </Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                onClick={() => {
                                    campaignForm
                                        .validateFields()
                                        .then(_ =>setSpinning(true) || SmsTaskService.sendSms(campaignForm.getFieldsValue()))
                                        .then(report => {
                                            setSpinning(false);
                                            notification.success({
                                                key: `csend_${Date.now()}`,
                                                message: "Task Finished",
                                                description: <>
                                                    <Text type="default">CampaignId: {report.campaignId}</Text><br></br>
                                                    <Text type="success">Success: {report.success}</Text><br></br>
                                                    <Text type="danger">Failure: {report.failure}</Text><br></br>
                                                    <Text type="default">TaskCount: {report.taskCount}</Text><br></br>
                                                </>,
                                                duration: 15,
                                            });
                                            campaignForm.resetFields();
                                        })
                                        .catch(error => {
                                            setSpinning(false) ||notification.error({
                                                key: `csend_${Date.now()}`,
                                                message: "Task Failed",
                                                description: <>
                                                    Error sending SMS.<br />{JSON.stringify(error)}
                                                </>,
                                                duration: 15
                                            });
                                        })
                                }}
                                children="Send"
                            />
                        </Space>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );

    return (<>
        {spinning ? <Spin tip="Sending SMS..." size="large">{dataForm}</Spin> : dataForm}
    </>)
};