import React, {useEffect, useRef, useState} from "react";
import {
    Form,
    Input,
    Button,
    Table,
    Space,
    Pagination,
    Card,
    Select,
    Row,
    Col,
    Modal,
    Typography,
    DatePicker,
    notification,
    List,
    Tag,
    Divider,
    Statistic,
    Spin,
    Tooltip,
    Upload,
    message,
    Checkbox,
    Descriptions, TimePicker
} from "antd";
import Title from "antd/es/typography/Title";
import {Br} from "./Br";
import dayjs from "dayjs";
import {ProductService} from "../services/ProductService";
import {TaskSearchForm} from "./TaskSearch";
import {CampaignService} from "../services/CampaignService";
import {useParams} from "react-router-dom";
import moment from "moment/moment";
import {SmsTaskService} from "../services/SmsTaskService";
import {SenderIdService} from "../services/SenderIdService";
import * as sheetjs from "xlsx";
import {FileDoneOutlined, FileTextOutlined, FileTextTwoTone} from "@ant-design/icons";
import {unflatten} from "../Util";


const SearchForm = ({onSearch}) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {// {[fieldName]: value}
        const formData = searchForm.getFieldsValue();

        ["cratedOn_fld0_value", "cratedOn_fld1_value"].forEach((n, i) => {
            const date = formData[n];
            formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD") : "";

            if (formData[n] === null) {
                delete formData[n];
            }
        });

        const queryData = ["phoneNumber", "cratedOn_fld0_value", "cratedOn_fld1_value"].reduce((acc, v) => {
            const field = v;
            const fieldOp = `${field.replace("_value", "")}_op`;
            const fieldValue = (acc[field] || "").trim();

            if (fieldValue === "") {
                delete acc[field];
                delete acc[fieldOp];
            } else {
                acc[field] = fieldValue;
            }

            return acc;
        }, formData);
        onSearch(queryData);
    };

    return (<>
        <Form
            form={searchForm}
            labelAlign="left"
        >
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="phoneNumber" label="Campaign Phone Number" children={<Input />} />
            <Form.Item name="phoneNumber_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item wrapperCol={{ offset: 5 }} style={{display:'inline-block', margin:'0px'}} colon={false} label=' '>
                <Button
                    type="primary"
                    htmlType="submit"
                    onClick={performSearch}
                    children={"Search"}
                />
            </Form.Item>
        </Form>
    </>);
};


const DataPager = ({totalPagingItems, currentPage, onPagingChange}) => {
    return (<>
        <Space align="end" direction="vertical" style={{width: "100%"}}>
            <Pagination
                total={totalPagingItems}
                defaultPageSize={10}
                pageSizeOptions={["10", "20", "50", "100", "200"]}
                showSizeChanger={true}
                onChange={onPagingChange}
                current={currentPage}
            />
        </Space>
    </>);
};
const SchedulePickerWithType = ({type}) => {
    if (type === 'default') return (<>
        <Row>
            <Col md={12}>
                <Form.Item name="schedule.props.scheduleStart" initialValue={moment(new Date())}>
                    <DatePicker placeholder="Date" showTime use12Hours={true} format="YYYY-MM-DD HH:mm:ss"/>
                </Form.Item>
            </Col>
        </Row>
    </>);
    if (type === 'DateRange') return (<>
        <Row>
            <Col md={12}>
                <Form.Item name="schedule.props.scheduleStart" initialValue={moment(new Date())}>
                    <DatePicker placeholder="Start Date" showTime use12Hours={true} format="YYYY-MM-DD HH:mm:ss"/>
                </Form.Item>
            </Col>
            <Col md={12}>
                <Form.Item name="schedule.props.scheduleEnd" initialValue={moment(new Date())}>
                    <DatePicker placeholder="End Date" showTime use12Hours={true} format="YYYY-MM-DD HH:mm:ss"/>
                </Form.Item>
            </Col>
        </Row>
    </>);
    if (type === 'DateRangeAndActiveHours') return (<>
        <Row>
            <Descriptions title="Date">
                <Descriptions.Item label="Start-Date" span={1} labelStyle={{ alignItems:'start'}}>
                    <Form.Item name="schedule.props.scheduleStart" initialValue={moment(new Date())}>
                        <DatePicker placeholder="Start Date" showTime use12Hours={true} format="YYYY-MM-DD HH:mm:ss"/>
                    </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label="End-Date" span={1} labelStyle={{ alignItems:'start'}}>
                    <Form.Item name="schedule.props.scheduleEnd" initialValue={moment(new Date())}>
                        <DatePicker placeholder="End Date" showTime use12Hours={true} format="YYYY-MM-DD HH:mm:ss"/>
                    </Form.Item>
                </Descriptions.Item>
            </Descriptions>
        </Row>
        <Row>
            <Descriptions title="Active Hours" Layout="vertical" >
                <Descriptions.Item label="Start at" span={1} labelStyle={{ alignItems:'start'}}>
                    <Form.Item name="schedule.props.activeHourStart" initialValue={moment(new Date())}>
                        <TimePicker placeholder="Start Time"/>
                    </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label="End at" span={1} labelStyle={{ alignItems:'start'}}>
                    <Form.Item name="schedule.props.activeHourEnd" initialValue={moment(new Date()).add(1, 'hours')}>
                        <TimePicker placeholder="End Time"/>
                    </Form.Item>
                </Descriptions.Item>
            </Descriptions>
        </Row>
        {/* <Row>
            <Descriptions title="Extended Hours" Layout="vertical" >
                <Descriptions.Item label="Start at" span={1} labelStyle={{ alignItems:'start'}}>
                    <Form.Item name="schedule.props.activeHourStart" initialValue={moment(new Date())}>
                        <TimePicker placeholder="Start Time"/>
                    </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label="End at" span={1} labelStyle={{ alignItems:'start'}}>
                    <Form.Item name="schedule.props.activeHourEnd" initialValue={moment(new Date()).add(1, 'hours')}>
                        <TimePicker placeholder="End Time"/>
                    </Form.Item>
                </Descriptions.Item>
            </Descriptions>
        </Row>*/}
    </>);
};

const EditForm = ({recordArg, onRecordSaved,close }) => {
    const { Option } = Select;
    const [writeForm] = Form.useForm();

    const [isCreateForm, setIsCreateForm] = useState(true);
    const [lastWrite, setLastWrite] = useState(recordArg);

    const [senderIds, setSenderIds] = useState([]);
    useEffect(()=> {
        SenderIdService.fetchRecords({})
            .then(data=>{
                setSenderIds(data.senderIds);
            })
    },[])

    // useEffect(() => writeForm.resetFields(), [recordArg, writeForm]);
    useEffect(() => {
        setIsCreateForm(Object.keys(recordArg).length === 0);
        writeForm.resetFields();
        writeForm.setFieldsValue(recordArg);
    }, [recordArg]);

    useEffect( () => {
        if (lastWrite === recordArg) return;
        isCreateForm && writeForm.resetFields();
    },[lastWrite]);
    const [type, setType] = useState('default');

    return (<>
        <Form
            form={writeForm}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 20 }}
            labelAlign={"left"}
            style={{
                padding:'35px'
            }}
            // onFinish={() => writeForm.resetFields()}
        >
            <Form.Item name="campaignName" label="Campaign Name" rules={[{ required: true }]} children={<Input disabled={!isCreateForm}/>} />
            <Form.Item name="campaignId" label="Campaign ID" rules={[{ required: false }]} hidden children={<Input />} />

            <Form.Item name="senderId" label="Sender ID" rules={[{ required: false }]}>
                <Select style={{ minWidth: 150 }}>
                    {senderIds.map((v, i) => <Select.Option key={v.senderId} value={v.senderId}>{v.senderId}</Select.Option>)}
                </Select>
            </Form.Item>

            <Form.Item
                name="phoneNumbers"
                label={<>
                    <span>Contacts</span>
                    <Tooltip title="Import (Excel, CSV, Text)">
                        &nbsp;&nbsp;
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
                                    writeForm.setFieldsValue({ ...writeForm.getFieldsValue, phoneNumbers: info.file.response.join(", ") })
                                    return message.success(`Found ${info.file.response.length} MSISDN(s)`);
                                }
                                if (info.file.status === 'error') {
                                    return message.error(`Error: ${info.file.error.toUpperCase()}`);
                                }
                            }}
                            showUploadList={false}
                            children={<Button shape="round" icon={<FileTextTwoTone />} />}
                        />
                    </Tooltip>
                </>}
                rules={[{ required: false }]}
                hidden
                children={<Input.TextArea />}
            />

            <Form.Item
                name="message"
                label={<>
                    <span>Message Text</span>
                    <Space style={{ display: "none" }}>
                        &nbsp;&nbsp;
                        <Tooltip title="Import Draft"><Button shape="circle" icon={<FileTextOutlined />} /></Tooltip>
                        <Tooltip title="Import Template"><Button shape="circle" icon={<FileDoneOutlined />} /></Tooltip>
                    </Space>
                </>}
                rules={[{ required: true }]}
                children={<Input.TextArea />}
            />
            <Form.Item name="schedule.policy" id="selected" label="Schedule Policy" initialValue={type}>
                <Select onChange={setType}>
                    <Option value="default">Default (Schedule On)</Option>
                    <Option value="DateRange">Start-End Date</Option>
                    <Option value="DateRangeAndActiveHours">Start-End Date, Active-hours</Option>
                </Select>
            </Form.Item>
            <Form.Item colon={false} label=" " style={{ marginTop:'0px'}} >
                <Card>
                    <SchedulePickerWithType type={type}/>
                </Card>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8 }}>
                <Space>
                    <Form.Item name="isUnicode" valuePropName="checked" initialValue={true} style={{ margin: 0 }}>
                        <Checkbox children={<Tooltip title="using unicode charecters">Unicode</Tooltip>} />
                    </Form.Item>

                    <Form.Item name="isFlash" valuePropName="checked" style={{ margin: 0 }}>
                        <Checkbox children={<Tooltip title="is a flash sms">Flash</Tooltip>} />
                    </Form.Item>
                </Space>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 20 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    onClick={() => writeForm
                        .validateFields()
                        .then(_ => writeForm
                            .validateFields()
                            .then(_ => {
                                const formData = writeForm.getFieldsValue();

                                for (const [key, value] of Object.entries(formData)) {
                                    if (key.includes("schedule.props.")) {
                                        formData[key] = value.format("YYYY-MM-DD HH:mm:ss");
                                    }
                                }

                                const formDataUf = unflatten(formData);
                                const schedule = formDataUf.schedule;

                                if (schedule.props.activeHourStart) {
                                    schedule.props.activeHourStart = schedule.props.activeHourStart.split(" ")[1];
                                    if (!schedule.props.activeHourStart) delete schedule.props.activeHourStart;
                                }
                                if (schedule.props.activeHourEnd) {
                                    schedule.props.activeHourEnd = schedule.props.activeHourEnd.split(" ")[1];
                                    if (!schedule.props.activeHourStart) delete schedule.props.activeHourStart;
                                }

                                delete formDataUf.schedule;
                                formDataUf.schedules = [window.btoa(JSON.stringify(schedule))].join(",");
                                return CampaignService.saveCampaign(formDataUf);
                            })
                            .then(campaign => {
                                onRecordSaved(campaign);
                                setLastWrite(campaign);
                                notification.success({
                                    key: `corder_${Date.now()}`,
                                    message: "Task Complete",
                                    description: <>Campaign created: {campaign.campaignId}</>,
                                    duration: 5
                                });
                            })
                            .catch(error => {
                                notification.error({
                                    key: `corder_${Date.now()}`,
                                    message: "Task Failed",
                                    description: <>Error creating order.<br />{error.message}</>,
                                    duration: 5
                                });
                            }))
                        .catch(_ => { })
                    }
                    children={"Submit"}
                />
                <Button onClick={close} style={{backgroundColor: '#FF0000', color: 'white', border: 'none',marginLeft:5}}>Close</Button>
            </Form.Item>

        </Form>
    </>);
};

export const CampaignTaskReport = () => {
    const {campaignId} = useParams();

    const [lastQuery, setLastQuery] = useState({});
    const [campaign, setCampaign] = useState({});
    const [campaignFetchError, setCampaignFetchError] = useState(null);

    const [tasks, setTasks] = useState([]);
    const [campaignTasksFetchCount, setCampaignTasksFetchCount] = useState(0);

    const [modalData, setModalData] = useState(null);
    const showModal = data => setModalData(data);
    const handleOk = () => setModalData(null);
    const handleCancel = () => setModalData(null);
    const [saving,setSaving] = useState(false);
     const [campaignModalData, setCampaignModalData] =useState(null);
     const showCampaignModal = data => setCampaignModalData(data);
     const handleCancleCampaign = () => setCampaignModalData(null);

    const [modalDataMsg, setModalDataMsg] = useState(null);
    const showModalMsg = data => setModalDataMsg(data);
    const handleOkMsg = () => setModalDataMsg(null);
    const handleCancelMsg = () => setModalDataMsg(null);


    const hasSubTask = task => {
        if(task.instances && task.instances.split(",").length > 1){
            return true;
        } else {
            return false;
        }
    };

    const unixToMomentTime = value => {
        if(value==null) return "";
        const parseValue = parseInt(value)
        const finalTime=  moment(parseValue).format('MMMM Do YYYY, h:mm:ss a');
        return finalTime;
    }

    useEffect(() => {
        CampaignService.fetchCampaignTasks({ ...lastQuery, campaignId })
            .then((data) => {
                console.log(data.taskReports);
                setCampaign(data.campaign);
                setTasks(data.tasks);
                setCampaignTasksFetchCount(data.count);
                setCampaignFetchError(null);
            })
            .catch(error => {
                setCampaign([]);
                setCampaignTasksFetchCount(0);
                setCampaignFetchError(error);
            });
    }, [lastQuery]);

    useEffect(() => {
        setLastQuery({ page: 1, limit: 10 })
    }, []);
    const onCampaignStart = campaign => setSaving(true) || CampaignService
        .startCampaign(campaign)
        .then(result => {
            notification.success({
                key: `send_${Date.now()}`,
                message: "Task Finished",
                description: <>Campaign started. Next schedule: {result.schedule}</>,
                duration: 5
            });
        })
        .catch(error => {
            notification.error({
                key: `send_${Date.now()}`,
                message: "Task Failed",
                description: <>Task Failed: {JSON.stringify(error.code)}</>,
                duration: 5
            });
        })
        .finally(_ => setSaving(false));

    const getCampaignStatus =(status)=>{
        console.log(status.pendingTaskCount);
        if (status.pendingTaskCount === 0){
            return <Tag color={"success"}>Finished</Tag>
        }
        if (![null, "enabled"].includes(status.scheduleStatus)){
            return <Tag color={"success"}>Running</Tag>
        }
    }

    return (<>
        <Card bordered={false} bodyStyle={{padding: 0}} style={{padding: 0, margin: 0}}>
            <List
                header={
                    <Typography.Text strong>
                        <span>Campaign Overview</span>
                        &nbsp;
                        <Tag>{campaignId}</Tag>
                        <span style={{padding:5}}>{getCampaignStatus(campaign)}</span>
                        <Button
                            type="primary"
                            onClick={() => onCampaignStart({ campaignId: campaign.campaignId })}
                            children={"Start Campaign"}
                            disabled={campaign.pendingTaskCount === 0}
                        />
                        <Button
                            type="danger"
                            onClick={() => CampaignService.stopCampaign(campaign)
                                .then(result => {
                                    notification.success({
                                        key: `send_${Date.now()}`,
                                        message: "Task Finished",
                                        description: <>Campaign stopped.</>,
                                        duration: 5
                                    });
                                })
                                .catch(error => {
                                    notification.error({
                                        key: `send_${Date.now()}`,
                                        message: "Task Failed",
                                        description: <>Task Failed: {JSON.stringify(error.code)}</>,
                                        duration: 5
                                    });
                                })
                        }
                            children={"Stop Campaign"}
                            // disabled={campaign.pendingTaskCount === 0}
                            style={{marginLeft: 10}}
                        />
                        <Button
                            type="primary"
                            onClick={() => showCampaignModal(campaign)}
                            children={"Edit Campaign"}
                            // disabled={campaign.pendingTaskCount === 0}
                            style={{marginLeft: 10}}
                        />
                    </Typography.Text>
                }
                bordered
            >
                <Card bordered={false} style={{margin: "0px"}}>
                    <Space split={<Divider type="vertical" style={{height: "16vh"}}/>} size={"large"}
                           style={{alignItems: 'start'}}>
                        <div
                            children={
                                [
                                    ["campaignName", "Campaign Name"],
                                    ["createdOn", "Date", d => dayjs(d).format("MMM D, YYYY - hh:mm A")],
                                    ["message", "Message"]
                                ].map(([k, l, toValue = v => v]) => (<Row gutter={[10]} key={k}>
                                    <Col><Typography.Paragraph strong>{l}</Typography.Paragraph></Col>
                                    <Col>&nbsp;:&nbsp;</Col>
                                    <Col><Typography.Text>{toValue(campaign[k])}</Typography.Text></Col>
                                </Row>))
                            }
                        />
                        <List
                            grid={{gutter: 24}}
                            dataSource={[
                                [
                                    ["sentTaskCount", "Sent", "success", v => v || 0],
                                    ["failedTaskCount", "Failed", "secondary", v => v || 0],
                                    ["pendingTaskCount", "Pending", "warning", v => v || 0],
                                    ["totalTaskCount", "Total Task", "danger", v => v],
                                ]
                            ]}
                            renderItem={item => item.map(([key, label, type, toValue]) => (<Col>
                                <Statistic
                                    title={<Typography.Text type={type} strong>{label}</Typography.Text>}
                                    value={toValue(campaign[key])}
                                    key={key}
                                />
                            </Col>))}
                        />
                        <Col>
                            <Card title={<Title style={{lineHeight: '0.5'}} level={4}>Search Task</Title>}
                                  size="small"
                                  style={{border: 'none', margin: '0px', padding: '0px'}}
                                  headStyle={{border: 'none'}}
                                  bodyStyle={{padding: 0, margin: 0, marginLeft: 10}}
                            >
                                <SearchForm onSearch={data => setLastQuery({ ...(data || {}), page: 1, limit: lastQuery.limit })}/>
                            </Card>
                        </Col>
                    </Space>
                </Card>
            </List>
        </Card>

        <Card title={<Title level={5}>Campaign Tasks</Title>} headStyle={{backgroundColor: "#f0f2f5", border: 0, padding: '0px'}}>
            <Table
                size="small"
                scroll={{
                    x: 2000,
                }}
                indentSize= '15'
                dataSource={Object.values(tasks || {}).map((taskGroup, i) => {
                    const parentTask = taskGroup[0];
                    parentTask.children = taskGroup.slice(1);
                    // if (!hasSubTask(taskGroup)) {
                    //     return { ...taskGroup, key: i };
                    // }
                    //
                    // const newTask = { ...taskGroup, key: i };

                    // newTask.children = taskGroup.instances.split(',').map((msgChunk, i) =>{
                    //     const decodedMsgChunk = atob(msgChunk);
                    //     return { ...taskGroup, key: i+"/"+i, message: decodedMsgChunk };
                    // });
                    // const instances = taskGroup.instances.split(',');
                    // const charCount = taskGroup.message.length;
                    // const msgCount = instances.length;
                    // const charCountPerMsg = charCount/msgCount;
                    // newTask.children = instances.map((msgChunk, i) =>{
                    //     return { ...taskGroup, key: i+"/"+i, message: taskGroup.message.substring(charCountPerMsg * i, charCountPerMsg * (i+1)) };
                    // });
                    //
                    // return newTask;
                    return parentTask;
                })}
                rowKey={parentTask=> parentTask.campaignTaskId}
                locale={{emptyText: campaign === null ? "E" : "NO DATA"}}
                pagination={false}

            >
                <Table.Column
                    title={"#"}
                    render={(_, __, i) => (lastQuery.page - 1) * lastQuery.limit + (++i)}
                />

                <Table.Column title="Phone Number" dataIndex={"phoneNumber"}/>
                <Table.Column title="Task Status" dataIndex={"status"}
                              render={v => [<Tag color={"processing"}>pending</Tag>, <Tag color={"success"}>sent</Tag>,
                                  <Tag
                                      color={"error"}>error</Tag>][[v === "pending", v === "sent", v === "failed"].indexOf(!0)]}/>
                <Table.Column title="Status Message" dataIndex={undefined}
                              render={(v, r, i) => (r.statusExternal && "sent") || (r.errorCode || r.errorCodeExternal)}/>
                <Table.Column title="Package" dataIndex={"packageId"}/>
                <Table.Column title="External Status Update Time" dataIndex={"lastUpdatedTxStamp"}
                              render={(unixToMomentTime)}/>
                <Table.Column title="Error Code" dataIndex={"errorCode"}/>
                <Table.Column title="External Error Code" dataIndex={"errorCodeExternal"}/>
                <Table.Column title="External Task Id" dataIndex={"taskIdExternal"}/>
                {/*<Table.Column title="Message" dataIndex={"message"} width={"25vw"}/>*/}
                <Table.Column title="Message" dataIndex={"message"} width={"150pt"}
                              render={(v, i) =>v.length>6?<>
                              <span
                                  style={{textOverflow:"ellipsis",
                                      whiteSpace:"nowrap",
                                      maxWidth: "50pt",
                                      display: "inline-block",
                                      overflow:"hidden",
                                      verticalAlign:"middle"
                                  }}
                              >{v.replace(/\s*,\s*/g, " ")}</span>
                                  <Button type="link" onClick={() => showModalMsg(v.replace(/\s*,\s*/g, " "))}>Show all</Button>
                              </>:v}/>
                <Table.Column title="Next Retry Time" dataIndex={"nextRetryTime"} render={(unixToMomentTime)}/>
                <Table.Column title="Last Retry Time" dataIndex={"lastRetryTime"} render={(unixToMomentTime)}/>
                <Table.Column title="Terminating Called Number" dataIndex={"terminatingCalledNumber"}/>

                <Table.Column
                    dataIndex={undefined}
                    render={(value, record, index) =>
                        <Button
                            onClick={_ => CampaignService
                                .removeCampaignTask(record)
                                .then(data => {
                                    notification.success({
                                        key: `dtask_${Date.now()}`,
                                        message: "Task Finished",
                                        description: `Task deleted: ${record.phoneNumber}`,
                                        duration: 5
                                    });
                                })
                                .catch(error => {
                                    notification.error({
                                        key: `dtask_${Date.now()}`,
                                        message: "Task Failed",
                                        description: <>
                                            Error Deleting Task.<br />{JSON.stringify(error)}
                                        </>,
                                        duration: 5
                                    });
                                })
                            }
                            type="primary"
                            disabled={!["pending", "suspended", "failed", null].includes(record.status)}
                        >Delete</Button>
                    }
                />
                <Table.Column
                    dataIndex={undefined}
                    render={(_, record, i) =>
                        <Button onClick={() => showModal(record)} type="primary"
                                style={{
                                    background: "#1890ff",
                                    borderColor: "#1890ff"
                        }}>Schedule</Button>
                    }
                />
            </Table>
            <DataPager totalPagingItems={campaignTasksFetchCount} currentPage={lastQuery.page}
                       onPagingChange={(page, limit) => setLastQuery({ ...lastQuery, page, limit })} />
        </Card>

        <Modal title="Message" key="createCampaign" visible={!!modalDataMsg} onOk={handleOkMsg} onCancel={handleCancelMsg}>
            {modalDataMsg}
        </Modal>
        <Modal width={1000} header="Create Campaign" key="createCampaign" visible={campaignModalData} footer={null} maskClosable={false} closable={false} style={{ top: 20 }} bodyStyle={{height:"57rem"}}>
            <EditForm close={handleCancleCampaign} recordArg={campaignModalData} onRecordSaved={_ => setLastQuery({ ...lastQuery, orderBy: "updatedOn DESC", page: 1 })} />
        </Modal>
        <Modal width={1000} visible={modalData !== null} onCancel={handleCancel}
               footer={[<Button style={{backgroundColor: '#FF0000', color: 'white', border: 'none'}} onClick={handleOk}>Close</Button>]} maskClosable={false} closable={false}
        >
            <Table
                dataSource={((modalData || {allRetryTimes: ""}).allRetryTimes || "")
                    .split(",").map((value, index) => (
                        {
                            key: index,
                            date: value,
                            status: 'failed',
                            errorCode: '111',
                        }
                    ))}
                rowKey={"phoneNumber"}
                locale={{emptyText: campaign === null ? "E" : "NO DATA"}}
                pagination={false}
                style={{
                    padding: 15
                }}
            >
                <Table.Column
                    title={"#"}
                    render={(_, __, i) => (lastQuery.page - 1) * lastQuery.limit + (++i)}
                />
                <Table.Column title="Schedule" dataIndex={"date"} render={(unixToMomentTime)}/>
            </Table>
        </Modal>
        <Modal visible={saving} footer={null} closable="false" maskClosable={false}>
            <Spin tip="Sending Request" />
        </Modal>

    </>);
};
