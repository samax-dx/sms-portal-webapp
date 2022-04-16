import { Button, Card, Form, Input, Space, Tooltip, Checkbox, notification } from "antd";
import { useActor } from "@xstate/react";
import { useEffect } from "react";
import { DebounceSelect } from "./DebounceSelect";
import { Campaign } from "../services/Campaign";
import { Inventory } from "../services/Inventory";
import { SmsTask } from "../services/SmsTask";


const fetchCampaignsByName = async (campaignName) => Campaign
    .fetchCampigns({}, {
        data: {
            campaignName,
            campaignName_op: "contains",
            pending: 0,
            pending_op: "greaterThan"
        }
    })
    .then(({ campaigns = [] }) => [{ campaignName }, ...campaigns]
        .map(c => ({ label: `${c.campaignName}`, value: JSON.stringify(c) }))
    ).catch(() => { });


const fetchInventoryByName = async (productName) => Inventory
    .fetchProducts({}, {
        data: {
            productName,
            productName_op: "contains"
        }
    })
    .then(({ products = [] }) => products
        .map(p => ({ label: `${p.productName}`, value: p.productId }))
    ).catch(() => { });

export const SendSMS = ({ actor: editorActor }) => {
    const [campaignForm] = Form.useForm();

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

    const onEdited = () => editorState.matches("isEditing") || emitEditor("EDIT_RECORD");

    return (<>
        <Card>
            <Form
                form={campaignForm}
                initialValues={{ senderId: "8809638010035", isUnicode: true }}
                layout="vertical"
                wrapperCol={{ span: 8 }}
            >
                <Form.Item
                    name="campaignName"
                    label="Campaign Name"
                    rules={[{ required: true }]}
                >
                    <DebounceSelect
                        showSearch
                        placeholder="Select Campaign"
                        fetchOptions={fetchCampaignsByName}
                        onChange={v => {
                            Campaign
                                .fetchCampaignPendingTasks({}, {
                                    data: JSON.parse(v)
                                })
                                .then(data => {
                                    onEdited();
                                    return data;
                                })
                                .then(({ campaign, tasks }) => {
                                    campaignForm.setFieldsValue({
                                        phoneNumbers: tasks.map(t => t.phoneNumber).join(","),
                                        message: campaign.message,
                                        isUnicode: campaign.isUnicode,
                                        isFlash: campaign.isFlash
                                    }) + "1" && emitEditor("FETCHED");
                                })
                                .catch(_ => {
                                    //
                                });
                        }}
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <Form.Item
                    name="campaignPackage"
                    label="Campaign Package"
                    rules={[{ required: true }]}
                >
                    <DebounceSelect
                        showSearch
                        placeholder="Select Package"
                        fetchOptions={fetchInventoryByName}
                        style={{ width: '100%' }}
                    />
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
                                onClick={() => emitEditor({ type: "SAVE_RECORD", data: campaignForm.getFieldsValue() })}
                                disabled={!editorState.matches("isEditing")}
                                children="Save"
                            />
                            <Button
                                type="primary"
                                htmlType="submit"
                                onClick={() => {
                                    campaignForm
                                        .validateFields()
                                        .then(_ => SmsTask.sendSms({}, {
                                            data: {
                                                campaignId: JSON.parse(campaignForm.getFieldsValue().campaignName).campaignId || campaignForm.getFieldValue("campaignId"),
                                                campaignPackage: campaignForm.getFieldsValue().campaignPackage
                                            }
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
                                disabled={editorState.matches("start") || !editorState.matches("didSave")}
                                children="Send"
                            />
                        </Space>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    </>)
};
