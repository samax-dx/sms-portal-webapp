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
    Modal, Typography, DatePicker, notification, List, Tag, Divider, Statistic, Spin
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
                console.log(data);
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
                dataSource={tasks.map(task => {
                    //alert(JSON.stringify(task));

                    if (!hasSubTask(task)) {
                        return task;
                    }

                    const newTask = {...task};

                    const children = task.instances.split(',').map(msgChunk => {
                        const decodedMsgChunk = window.atob(msgChunk);
                        const clonedTask = {...task};
                        clonedTask.message = decodedMsgChunk;
                        return clonedTask;
                    })
                    newTask.children = children;
                    return newTask;
                })}
                rowKey={"phoneNumber"}
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
                <Table.Column title="Message" dataIndex={"message"} width={"25vw"}/>
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
