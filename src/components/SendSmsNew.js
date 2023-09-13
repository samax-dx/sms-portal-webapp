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
    Spin,
    Radio,
    Col,
    Dropdown,
    Modal,
} from "antd";
import * as sheetjs from "xlsx";
import { DownOutlined, FileTextTwoTone } from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import { SmsTaskService } from "../services/SmsTaskService";
import { SenderIdService } from "../services/SenderIdService";
import React, { useEffect, useState } from "react";
import { GroupService } from "../services/ContactBook/GroupService";
import { ContactBookService } from "../services/ContactBook/ContactBookService";
import { useParams } from "react-router-dom";
import { PartyIdCatcher } from "./HomeNew";
import { MAX_CHARACTER } from "../config";


export const SendSmsNew = () => {
    // const {groupId} = useParams();
    const [campaignForm] = Form.useForm();
    const [spinning, setSpinning] = useState(false);
    const [encoding, setencoding] = useState("gsm7");
    const [length, setLength] = useState(0);
    const [isChecked, setIsChecked] = useState({
        english: true,
        bangla: false,
    });
    const [isLastChecked, setIsLastChecked] = useState({
        english: true,
        bangla: false,
    });
    const [IsOver, setIsOver] = useState({
        english: true,
        bangla: false,
    });
    // useEffect(()=>{
    //
    // })
    // const [letterCount, setLetterCount] = useState(0);
    const [inputValue, setInputValue] = useState("");

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
    const showModal = (data) => setModalData(data);
    const handleOk = () => setModalData(null);
    const handleCancel = () => setModalData(null);

    const partyId = PartyIdCatcher();

    const [senderIds, setSenderIds] = useState([]);
    useEffect(() => {
        SenderIdService.fetchRecords({ partyId }).then((data) => {
            setSenderIds(data.senderIds);
        });
    }, []);

    useEffect(() => {
        GroupService.fetchRecords(lastQuery)
            .then((data) => {
                console.log(data);
                setGroups(data.groups);
                setGroupsFetchCount(data.count);
                setGroupsFetchError(null);
            })
            .catch((error) => {
                setGroups([]);
                setGroupsFetchCount(0);
                setGroupsFetchError(error);
            });
    }, [lastQuery]);

    useEffect(() => {
        setLastQuery({ page: 1, limit: 10 });
    }, []);

    useEffect(() => {
        setLastQuery({ page: 1, limit: 10 });
    }, []);
    // console.log(length);
    const resetMsgField = () => {
        campaignForm.setFieldsValue({ message: "" });
        setLength(0);
    };
    const handleRadioChange = (e) => {
        setencoding(e.target.value);
        resetMsgField();
    };
    // console.log(length);
    // console.log(encoding);

    // function isOverFlowPast(currentSize,isBangla,value)
    // {
    //   if (inputValue.length > MAX_CHARECTER) {
    //     warningMessage.style.display = 'block';
    //   } else {
    //     warningMessage.style.display = 'none';
    //   }
    // }
    // }


    function isOverFlowCurrentMessage(currentSize, isBangla, value) {
        if (!isBangla && isLastChecked.english) {
            if (currentSize >= MAX_CHARACTER) {
                //console.log("hi");
                // alert("jiashdjkf");
                return true;
            }
            currentSize++;
            console.log(currentSize);
        } else {
            if (currentSize*2 >= MAX_CHARACTER) {
                //console.log("hi");
                // alert("jiashdjkf");
                return true;
            }
            currentSize++;
            console.log(currentSize);
            // isLastChecked.english
            // ? currentSize =(currentSize*2)+2
            // : currentSize = currentSize+2;
            // console.log(currentSize);

            const englishRegex = /[!@#$%^&*(),.?":{}|<>a-zA-Z]/;
            const banglaRegex = /[\u0980-\u09FF]/;
            setIsLastChecked({
                english: englishRegex.test(value) && !banglaRegex.test(value),
                bangla: banglaRegex.test(value),
            });
        }

        return false;
    }
    const handleTextChange = (e) => {
        const { value } = e.target;
        // const englishRegex = /[a-zA-Z]/;
        const englishRegex = /[!@#$%^&*(),.?":{}|<>a-zA-Z]/;
        const banglaRegex = /[\u0980-\u09FF]/;
        if (value.trim() === "") {
            setIsChecked({
                english: true,
                bangla: false,
            });
        } else {
            setIsChecked({
                english: englishRegex.test(value) && !banglaRegex.test(value),
                bangla: banglaRegex.test(value),
            });
        }
        //
        // console.log(isOverFlowCurrentMessage())
        // console.log(currentSize);
        let isBangla = banglaRegex.test(value);
        // isOverFlowCurrentMessage(value.length-1,isBangla)?setInputValue(value):setInputValue(value.slice(0,isChecked.bangla||isBangla?50:100));
        if (isOverFlowCurrentMessage(value.length - 1, isBangla, value)) {
            // && isLastChecked.english
            if (isBangla) {
                if(isLastChecked.english) {
                    setIsOver({
                        english: false,
                        bangla: true
                    })
                    setIsLastChecked({
                        english: true,
                        bangla: false
                    });
                    setIsChecked({
                        english: true,
                        bangla: false
                    });
                }
                else {
                    const trimmedText = value.slice(0, MAX_CHARACTER/2);
                    setInputValue(trimmedText);
                    //calculateLength(trimmedText);
                    console.log(trimmedText.length);
                }
            }
            else
            {
                const trimmedText = value.slice(0, MAX_CHARACTER);
                setInputValue(trimmedText);
                //calculateLength(trimmedText);
                console.log(trimmedText.length);
            }

        }
        else {
            setIsOver({
                english: true,
                bangla: false
            })
            if (isBangla) {
                setInputValue(value.slice(0, MAX_CHARACTER/2));
                //calculateLength(value.length);
            }
            else
            {
                setInputValue(value.slice(0, MAX_CHARACTER));
                //calculateLength(value.length);
            }
            if (isBangla) {
                setLength(Math.ceil((value.length*2) / ((value.length*2) <= 140 ? 140 : 137)));
            }
            else {
                setLength(Math.ceil((value.length) / ((value.length) <= 160 ? 160 : 153)));
            }
        }

        // isOverFlowCurrentMessage(value.length-1,isBangla)?setInputValue(value):

        // setIsChecked({
        //     english: englishRegex.test(value) && !banglaRegex.test(value),
        //     bangla: banglaRegex.test(value)
        // });

        // calculateLength(e.target.value.length,encoding);

        // const value1 = value.value;
        // console.log(value1);
        // const count = value1.length;
        // setInputValue(value1.slice(0, MAX_CHARECTER));

        // calculateLength(value);
    };
    // const handlePaste = (e) => {
    //   // const pastedText = e.clipboardData.getData("text");
    //   // handleTextChange({ target: { value: pastedText } });
    //   const pastedText = e.clipboardData.getData("text");
    //   handleTextChange({ target: { value: inputValue + pastedText } });
    // };




    //const letterCount = inputValue.length;
    // const calculateLength = (msg,encoding) =>{
    //     switch(encoding.toLowerCase()) {
    //     case "gsm7":
    //          setLength(Math.ceil(msg / (msg <= 160 ? 160 : 153)));
    //         break;
    //     case "ucs2":
    //         setLength(Math.ceil(msg/ (msg <= 70 ? 70 : 67)));
    //         break;
    //     case "utf8":
    //         setLength(Math.ceil(msg / (msg <= 140 ? 140 : 137)));
    //         break;
    //     }
    // }
    // const calculateLength = (value) => {
    //   let letterCount = 0;
    //   for (let i = 0; i < value.length; i++) {
    //     const char = value[i];
    //     if (char.match(/[!@#$%^&*(),.?":{}|<>a-zA-Z]/)) {
    //       letterCount++;
    //     }
    //     else if (char.match(/[\u0980-\u09FF]/)) {
    //       letterCount+=2;
    //     }
    //     if (letterCount >= MAX_CHARACTER) {
    //       console.log(letterCount);
    //       break;
    //     }
    //   }
    //   if (isChecked.bangla === true) {
    //     console.log("gesi banglay");
    //     setLength(Math.ceil(letterCount / (letterCount <= 160 ? 160 : 153)));
    //   } else {
    //     console.log("gesi english e");
    //     setLength(Math.ceil(letterCount / (letterCount <= 140 ? 140 : 137)));
    //   }
    //   // setLength(Math.ceil(letterCount / 2));
    // };

    const { Title, Text } = Typography;
    return (
        <Spin spinning={spinning} size={"large"}>
            <Card
                style={{ marginLeft: 5 }}
                title={<Title level={5}>Send SMS</Title>}
                headStyle={{ backgroundColor: "#f0f2f5", border: 0, padding: "0px" }}
                size="small"
            >
                <Form
                    form={campaignForm}
                    initialValues={{
                        isUnicode: true /*, campaignPackage: campaignPackages[0] ? campaignPackages[0].productId : null*/,
                    }}
                    layout="vertical"
                    wrapperCol={{ span: 8 }}
                    style={{ width: "92rem" }}
                >
                    <Form.Item
                        name="senderId"
                        label="Sender ID"
                        rules={[{ required: false }]}
                    >
                        <Select style={{ minWidth: 150 }}>
                            {senderIds.map((v, i) => (
                                <Select.Option key={v.senderId} value={v.senderId}>
                                    {v.senderId}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="phoneNumbers"
                        label={
                            <>
                                <span>Contacts</span>
                                &nbsp;
                                <Button onClick={showModal} shape={"round"}>
                                    Import From Contact Group
                                </Button>
                                &nbsp;
                                <Upload
                                    maxCount={1}
                                    accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
                                    customRequest={(r) => {
                                        const reader = new FileReader();

                                        reader.onload = () => {
                                            const contactBook = sheetjs.read(reader.result, {
                                                sheets: 0,
                                            });
                                            const contactSheet = Object.values(contactBook.Sheets)[0];

                                            const contacts = sheetjs.utils
                                                .sheet_to_json(contactSheet, { skipHidden: true })
                                                .reduce((acc, v) => {
                                                    if (v.msisdn !== undefined) {
                                                        acc.push(v.msisdn);
                                                    }
                                                    return acc;
                                                }, []);

                                            contacts.length
                                                ? r.onSuccess(JSON.stringify(contacts))
                                                : r.onError("zero_msisdn_found");
                                        };

                                        reader.onerror = () => {
                                            r.onError(reader.error.message);
                                        };

                                        reader.readAsArrayBuffer(r.file);
                                    }}
                                    onChange={(info) => {
                                        if (info.file.status === "done") {
                                            campaignForm.setFieldsValue({
                                                ...campaignForm.getFieldsValue,
                                                phoneNumbers: info.file.response.join(", "),
                                            });
                                            return message.success(
                                                `Found ${info.file.response.length} MSISDN(s)`
                                            );
                                        }
                                        if (info.file.status === "error") {
                                            return message.error(
                                                `Error: ${info.file.error.toUpperCase()}`
                                            );
                                        }
                                    }}
                                    showUploadList={false}
                                    children={<Button shape="round" icon={<FileTextTwoTone />} />}
                                />
                            </>
                        }
                        rules={[{ required: true }]}
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item
                        name="message"
                        label={
                            <>
                                <span>Message Text</span>
                                <span style={{ display: "none" }}>
                  &nbsp;
                                    <Button
                                        type="link"
                                        onClick={() => console.log("Import Draft")}
                                    >
                    [ Import Draft ]
                  </Button>
                                    &nbsp;
                                    <Button
                                        type="link"
                                        onClick={() => console.log("Import Template")}
                                    >
                    [ Import Template ]
                  </Button>
                </span>
                            </>
                        }
                        rules={[{ required: true }]}
                    >
                        <div>
                            {/*  if (isChecked.bangla === true) {*/}
                            {/*  console.log("gesi banglay");*/}
                            {/*  setLength(Math.ceil(letterCount / (letterCount <= 160 ? 160 : 153)));*/}
                            {/*} else {*/}
                            {/*  console.log("gesi english e");*/}
                            {/*  setLength(Math.ceil(letterCount / (letterCount <= 140 ? 140 : 137)));*/}
                            {/*}*/}
                            {isChecked.english?(<Input.TextArea
                                value={inputValue}
                                onChange={handleTextChange}
                                maxLength={MAX_CHARACTER}
                                autoSize={{minRows: 3, maxRows: 6}}
                            />) : (<Input.TextArea
                                value={inputValue}
                                onChange={handleTextChange}
                                maxLength={MAX_CHARACTER/2}
                                autoSize={{minRows: 3, maxRows: 6}}
                                lang="bn"
                            />)}
                            <span>
                {isChecked.english ? inputValue.length : inputValue.length*2}{" "}
                                / {MAX_CHARACTER}
              </span>
                            <br></br>
                            {inputValue.length === MAX_CHARACTER && isChecked.english ? (
                                <span style={{ color: "red" }}>Maximum Character Limit Reached</span>
                            ) : inputValue.length === MAX_CHARACTER / 2 && isChecked.bangla ? (
                                <span style={{ color: "red" }}>Maximum Character Limit Reached</span>
                            ) : IsOver.bangla ? (
                                <span style={{ color: "red" }}>Maximum Character Limit Reached</span>
                            ) : null}
                        </div>
                        {/*<div>*/}


                        {/*</div>*/}
                        {/*<span style={{alignItems:"center"}}>{isChecked.english ? letterCount:letterCount*2} / {MAX_CHARECTER}</span>*/}
                    </Form.Item>
                    {/*<Form.Item style={{alignItems:"left", marginRight:"40vw"}}>*/}
                    {/*    {isChecked.english? letterCount:letterCount*2} / {MAX_CHARECTER}*/}
                    {/*</Form.Item>*/}
                    <Form.Item>
                        <Space style={{ width: "100%" }}>
                            <span style={{ marginRight: 5 }}>SMS Count:{length}</span>
                            {/*    <Form.Item name="charEncoding" style={{ margin: 0}}>*/}
                            {/*        <Radio.Group name="radio" onChange={handleRadioChange} style={{display:"inline-flex"}}>*/}
                            {/*            /!*<Radio value={"gsm7"}>GSM7</Radio>*!/*/}
                            {/*            /!*<Radio value={"ucs2"}>UCS2</Radio>*!/*/}
                            {/*            /!*<Radio value={"utf8"}>UTF8</Radio>*!/*/}
                            {/*            <Radio  value={isChecked.english}>English</Radio>*/}
                            {/*            <Radio value={isChecked.bangla} >Bangla</Radio>*/}
                            {/*    </Form.Item>*/}
                            <Form.Item name="English" style={{ margin: 0 }}>
                                <Checkbox checked={isChecked.english}>
                                    <Tooltip title="is a English sms">English</Tooltip>
                                </Checkbox>
                            </Form.Item>
                            <Form.Item name="Bangla" style={{ margin: 0 }}>
                                <Checkbox checked={isChecked.bangla}>
                                    <Tooltip title="is a Bangla sms">Bangla</Tooltip>
                                </Checkbox>
                            </Form.Item>

                            {/*<Form.Item name="isFlash" valuePropName="checked" style={{ margin: 0 }}>*/}
                            {/*    <Checkbox><Tooltip title="is a flash sms">Flash</Tooltip></Checkbox>*/}
                            {/*</Form.Item>*/}
                            <Button
                                type="primary"
                                htmlType="submit"
                                onClick={() => {
                                    campaignForm
                                        .validateFields()
                                        .then(
                                            (_) =>
                                                setSpinning(true) ||
                                                SmsTaskService.sendSms(campaignForm.getFieldsValue())
                                        )
                                        .then((report) => {
                                            campaignForm.resetFields();
                                            setSpinning(false);
                                            setLength(0);
                                            setInputValue("");
                                            notification.success({
                                                key: `csend_${Date.now()}`,
                                                message: "Task Finished",
                                                description: (
                                                    <>
                                                        <Text type="default">
                                                            CampaignId: {report.campaignId}
                                                        </Text>
                                                        <br></br>
                                                        <Text type="success">
                                                            Success: {report.success}
                                                        </Text>
                                                        <br></br>
                                                        <Text type="danger">Failure: {report.failure}</Text>
                                                        <br></br>
                                                        <Text type="default">
                                                            TaskCount: {report.taskCount}
                                                        </Text>
                                                        <br></br>
                                                    </>
                                                ),
                                                duration: 15,
                                            });
                                        })
                                        .catch((error) => {
                                            setLength(0);
                                            setSpinning(false) ||
                                            notification.error({
                                                key: `csend_${Date.now()}`,
                                                message: "Task Failed",
                                                description: (
                                                    <>
                                                        Error sending SMS.
                                                        <br />
                                                        {JSON.stringify(error)}
                                                    </>
                                                ),
                                                duration: 15,
                                            });
                                        });
                                }}
                                children="Send"
                            />
                        </Space>
                    </Form.Item>
                    <Modal
                        key="contactGroup"
                        visible={modalData}
                        footer={null}
                        onCancel={handleCancel}
                        maskClosable={false}
                        closable={true}
                        style={{ top: 20 }}
                        bodyStyle={{ height: "8rem" }}
                    >
                        <Select
                            placeholder={"Import From Contact Group"}
                            style={{ width: 400, marginTop: 20, marginLeft: 20 }}
                            filterOption={(input, option) =>
                                (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            onSelect={(groupId) => {
                                ContactBookService.fetchGroupRecords({ groupId })
                                    .then((data) => {
                                        console.log(data);
                                        setGroup(data.group);
                                        setContacts(data.contacts);
                                        setContactFetchCount(data.count);
                                        setGroupFetchError(null);

                                        const contacts = data.contacts;

                                        const phoneNumbers = contacts.map(
                                            (v) => v["contactNumber"]
                                        );

                                        campaignForm.setFieldsValue({
                                            ...campaignForm.getFieldsValue,
                                            phoneNumbers: phoneNumbers.join(", "),
                                        });
                                        contacts.length > 0
                                            ? setModalData(null)
                                            : showModal(modalData);
                                    })
                                    .catch((error) => {
                                        setContacts([]);
                                        setContactFetchCount(0);
                                        setGroupFetchError(error);
                                    });
                            }}
                        >
                            {groups.map((data) => (
                                <Select.Option key={data.groupId} value={data.groupId}>
                                    {data.groupName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Modal>
                </Form>
            </Card>
        </Spin>
    );
};