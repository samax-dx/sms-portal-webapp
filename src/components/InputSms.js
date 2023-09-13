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

export const InputSms = () => {
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
    const resetMsgField = () => {
        campaignForm.setFieldsValue({ message: "" });
        setLength(0);
    };
    const handleRadioChange = (e) => {
        setencoding(e.target.value);
        resetMsgField();
    };


    function isOverFlowCurrentMessage(currentSize, isBangla, value) {
        if (!isBangla && isLastChecked.english) {
            if (currentSize >= MAX_CHARACTER) {
                return true;
            }
            currentSize++;
            console.log(currentSize);
        } else {
            if (currentSize*2 >= MAX_CHARACTER) {
                return true;
            }
            currentSize++;
            console.log(currentSize);

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
        const {value} = e.target;
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
        let isBangla = banglaRegex.test(value);
        if (isOverFlowCurrentMessage(value.length - 1, isBangla, value)) {
            if (isBangla) {
                if (isLastChecked.english) {
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
                } else {
                    const trimmedText = value.slice(0, MAX_CHARACTER / 2);
                    setInputValue(trimmedText);
                    //calculateLength(trimmedText);
                    console.log(trimmedText.length);
                }
            } else {
                const trimmedText = value.slice(0, MAX_CHARACTER);
                setInputValue(trimmedText);
                //calculateLength(trimmedText);
                console.log(trimmedText.length);
            }

        } else {
            setIsOver({
                english: true,
                bangla: false
            })
            if (isBangla) {
                setInputValue(value.slice(0, MAX_CHARACTER / 2));
                //calculateLength(value.length);
            } else {
                setInputValue(value.slice(0, MAX_CHARACTER));
                //calculateLength(value.length);
            }
            if (isBangla) {
                setLength(Math.ceil((value.length * 2) / ((value.length * 2) <= 140 ? 140 : 137)));
            } else {
                setLength(Math.ceil((value.length) / ((value.length) <= 160 ? 160 : 153)));
            }
        }
    };

    const { Title, Text } = Typography;
    return (
        <Spin spinning={spinning} size={"large"}>
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
            </Form.Item>
            <Form.Item>
                <Space style={{ width: "100%", marginLeft: "40%" }}>

                    <span style={{ marginRight: 5 }}>SMS Count:{length}</span>
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
                </Space>
            </Form.Item>
        </Spin>
    );
};