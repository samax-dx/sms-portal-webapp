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
    Spin, Radio, Col, Dropdown, Modal
} from "antd";
import * as sheetjs from "xlsx";
import {DownOutlined, FileTextTwoTone} from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import {SmsTaskService} from "../services/SmsTaskService";
import {SenderIdService} from "../services/SenderIdService";
import React, {useEffect, useState} from "react";
import {GroupService} from "../services/ContactBook/GroupService";
import {ContactBookService} from "../services/ContactBook/ContactBookService";
import {useParams} from "react-router-dom";
import {PartyIdCatcher} from "./HomeNew";


export const SendSmsNew = () => {
    // const {groupId} = useParams();
    const [campaignForm] = Form.useForm();
    const [spinning, setSpinning] = useState(false);
    const [encoding,setencoding] = useState('gsm7');
    const [length,setLength] = useState(0);

    const [groups, setGroups] = useState([]);
    const [groupsFetchCount, setGroupsFetchCount] = useState(0);
    const [groupsFetchError, setGroupsFetchError] = useState(null);
    const [lastQuery, setLastQuery] = useState({});

    const [group, setGroup] = useState({});
    const [groupFetchError, setGroupFetchError] = useState(null);

    const [contacts, setContacts] = useState([]);
    const [contactFetchCount, setContactFetchCount] = useState(0);
    // const partyId = PartyIdCatcher();


    const [modalData, setModalData] = useState(null);
    const showModal = data => setModalData(data);
    const handleOk = () => setModalData(null);
    const handleCancel = () => setModalData(null);

    const partyId = PartyIdCatcher();


    const [senderIds, setSenderIds] = useState([]);
    useEffect(()=> {
        SenderIdService.fetchRecords({partyId})
            .then(data=>{
                setSenderIds(data.senderIds);
            })
    },[])

    useEffect(() => {
        GroupService.fetchRecords(lastQuery)
            .then(data => {
                // console.log(data);
                setGroups(data.groups);
                setGroupsFetchCount(data.count);
                setGroupsFetchError(null);
            })
            .catch(error => {
                setGroups([]);
                setGroupsFetchCount(0);
                setGroupsFetchError(error);
            });
    }, [lastQuery]);

    useEffect(() => {
        setLastQuery({ page: 1, limit: 10 })
    }, []);

    useEffect(() => {
        setLastQuery({ page: 1, limit: 10 })
    }, []);
// console.log(length);
    const resetMsgField = () =>{
        campaignForm.setFieldsValue({message:''})
        setLength(0);
    }
    const handleRadioChange = (e) =>{
        setencoding(e.target.value);
        resetMsgField();
    }
    // console.log(length);
    // console.log(encoding);
    const handleTextChange =e=>{
        calculateLength(e.target.value.length,encoding)
    }
    const calculateLength = (msg,encoding) =>{
        switch(encoding.toLowerCase()) {
        case "gsm7":
             setLength(Math.ceil(msg / (msg <= 160 ? 160 : 153)));
            break;
        case "ucs2":
            setLength(Math.ceil(msg/ (msg <= 70 ? 70 : 67)));
            break;
        case "utf8":
            setLength(Math.ceil(msg / (msg <= 140 ? 140 : 137)));
            break;
        }
    }


    const { Title, Text } = Typography;


    return (
        <Spin spinning={spinning} size={"large"}>
        <Card style={{marginLeft:5}} title={<Title level={5}>Send SMS</Title>}
              headStyle={{backgroundColor:"#f0f2f5", border: 0,padding:'0px'}} size="small">
            <Form
                form={campaignForm}
                initialValues={{ isUnicode: true/*, campaignPackage: campaignPackages[0] ? campaignPackages[0].productId : null*/ }}
                layout="vertical"
                wrapperCol={{ span: 8 }}
                style={{width:'92rem'}}
            >
                <Form.Item name="senderId" label="Sender ID" rules={[{ required: false }]}>
                    <Select style={{ minWidth: 150 }}>
                        {senderIds.map((v, i) => <Select.Option key={v.senderId} value={v.senderId}>{v.senderId}</Select.Option>)}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="phoneNumbers"
                    label={<>
                        <span>Contacts</span>
                        &nbsp;
                        <Button onClick={showModal} shape={"round"}>Import From Contact Group</Button>
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
                    <Input.TextArea onChange={handleTextChange} showCount maxLength={100} autoSize={{ minRows: 3, maxRows: 6 }}/>
                </Form.Item>

                <Form.Item>
                    <Space style={{ width: "100%"}}>
                        <span style={{marginRight:5}}>SMS Count:{length}</span>
                            <Form.Item name="charEncoding" initialValue={"gsm7"} style={{ margin: 0}}>
                                <Radio.Group name="radio" onChange={handleRadioChange} style={{display:"inline-flex"}}>
                                    <Radio value={"gsm7"}>GSM7</Radio>
                                    <Radio value={"ucs2"}>UCS2</Radio>
                                    <Radio value={"utf8"}>UTF8</Radio>
                                </Radio.Group>
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
                                            campaignForm.resetFields();
                                            setSpinning(false);
                                            setLength(0);
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
                                        })
                                        .catch(error => {
                                            setLength(0);
                                            setSpinning(false) || notification.error({
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
                </Form.Item>
                <Modal key="contactGroup" visible={modalData} footer={null} onCancel={handleCancel} maskClosable={false} closable={true} style={{ top: 20 }} bodyStyle={{height:"8rem"}}>
                    <Select
                        placeholder={"Import From Contact Group"}
                        style={{ width: 400, marginTop: 20, marginLeft: 20 }}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        onSelect={(groupId) => {
                            ContactBookService.fetchGroupRecords({groupId})
                                .then((data) => {
                                    // console.log(data);
                                    setGroup(data.group);
                                    setContacts(data.contacts);
                                    setContactFetchCount(data.count);
                                    setGroupFetchError(null);

                                    const contacts = data.contacts;

                                    const phoneNumbers = contacts.map(v => v["contactNumber"]);

                                    campaignForm.setFieldsValue({
                                        ...campaignForm.getFieldsValue,
                                        phoneNumbers: phoneNumbers.join(", ")
                                    })
                                    contacts.length>0?setModalData(null):showModal(modalData);
                                })
                                .catch(error => {
                                    setContacts([]);
                                    setContactFetchCount(0);
                                    setGroupFetchError(error);
                                });
                            }
                        }
                    >
                        {groups.map((data) => <Select.Option key={data.groupId} value={data.groupId}>{data.groupName}</Select.Option>)}
                    </Select>
                </Modal>
            </Form>
        </Card>
        </Spin>
    );
};
