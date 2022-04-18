import { Button, Card, Form, Input, Space, Tooltip, Checkbox, notification, Select } from "antd";
import { useActor } from "@xstate/react";
import { useEffect, useState } from "react";
import { Campaign } from "../services/Campaign";
import { Inventory } from "../services/Inventory";
import { SmsTask } from "../services/SmsTask";


export const SendSMS = ({ actor: editorActor }) => {
    const [campaignForm] = Form.useForm();
    const [campaignPackages, setCampaignPackages] = useState([]);

    const [editorState, emitEditor] = useActor(editorActor);

    useEffect(() => {
        editorActor.subscribe(state => {
            if (state.event.type === "xstate.init") {
                return;
            }

            if (state.matches("isSaving") && state.event.data) {
                const campaign = state.event.data;
                const { campaignId, campaignName } = JSON.parse(state.event.data.campaignName)

                Campaign
                    .saveCampaign({}, {
                        data: {
                            campaignId,
                            campaignName,
                            isFlash: campaign.isFlash,
                            isUnicode: campaign.isUnicode,
                            message: campaign.message,
                            runCount: campaign.runCount,
                            phoneNumbers: campaign.phoneNumbers,
                            senderId: campaign.senderId
                        }
                    })
                    .then(data => notification.success({
                        message: "Task Finished",
                        description: <>
                            {JSON.stringify(data)}
                        </>,
                        duration: 5
                    }) || campaignForm.setFieldsValue({ campaignId: data.campaignId }) || emitEditor("SAVE_SUCCESS"))
                    .catch(error => notification.error({
                        message: "Task Failed",
                        description: <>
                            Error saving campaign.<br />{JSON.stringify(error.message)}
                        </>,
                        duration: 5
                    }) || emitEditor("SAVE_FAILURE"));
            }
        });
    }, []);

    useEffect(() => {
        Inventory
            .fetchProducts({}, { data: {} })
            .then(data => console.log("fetched inventory", data) || data)
            .then(data => setCampaignPackages(data.products || []))
            .catch(error => console.log("error fetching inventory", error));
    }, [])

    const onEdited = () => editorState.matches("isEditing") || emitEditor("EDIT_RECORD");

    return (<>
        <Card>
            <Form
                form={campaignForm}
                initialValues={{ senderId: "8801552146283", isUnicode: true, campaignPackage: campaignPackages[0] ? campaignPackages[0].productId : null }}
                layout="vertical"
                wrapperCol={{ span: 8 }}
            >
                <Form.Item
                    name="campaignPackage"
                    label="Campaign Package"
                    rules={[{ required: true }]}
                >
                    <Select style={{ minWidth: 150 }}>
                        {campaignPackages.map((v, i) => <Select.Option value={v.productId} key={i}>{v.productName}</Select.Option>)}
                    </Select>
                </Form.Item>

                <Form.Item name="senderId" label="Sender ID" rules={[{ required: true }]} children={<Input onChange={onEdited} />} />

                <Form.Item
                    name="phoneNumbers"
                    label={<>
                        <span>Contacts</span>
                        &nbsp;
                        <Button type="link" onClick={() => console.log("Import Draft")}>
                            [ Import (Excel, CSV, Text) ]
                        </Button>
                    </>}
                    rules={[{ required: true }]}
                    onChange={onEdited}
                >
                    <Input.TextArea />
                </Form.Item>

                <Form.Item
                    name="message"
                    label={<>
                        <span>Message Text</span>
                        &nbsp;
                        <Button type="link" onClick={() => console.log("Import Draft")}>
                            [ Import Draft ]
                        </Button>
                        &nbsp;
                        <Button type="link" onClick={() => console.log("Import Template")}>
                            [ Import Template ]
                        </Button>
                    </>}
                    rules={[{ required: true }]}
                    onChange={onEdited}
                >
                    <Input.TextArea />
                </Form.Item>

                <Form.Item>
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <span>SMS Count: ...</span>
                        <Space>
                            <Form.Item name="isUnicode" valuePropName="checked" style={{ margin: 0 }}>
                                <Checkbox onChange={onEdited}><Tooltip title="using unicode charecters">Unicode</Tooltip></Checkbox>
                            </Form.Item>
                            <Form.Item name="isFlash" valuePropName="checked" style={{ margin: 0 }}>
                                <Checkbox onChange={onEdited}><Tooltip title="is a flash sms">Flash</Tooltip></Checkbox>
                            </Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                onClick={() => {
                                    campaignForm
                                        .validateFields()
                                        .then(_ => SmsTask.sendSms({}, {
                                            data: { ...campaignForm.getFieldsValue() }
                                        }))
                                        .then(result => {
                                            notification.success({
                                                message: "Task Finished",
                                                description: <>
                                                    {JSON.stringify(result)}
                                                </>,
                                                duration: 5
                                            });
                                            campaignForm.resetFields();
                                        })
                                        .catch(error => {
                                            notification.error({
                                                message: "Task Failed",
                                                description: <>
                                                    Error sending SMS.<br />{JSON.stringify(error)}
                                                </>,
                                                duration: 5
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
    </>)
};
