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
    Modal, Typography, DatePicker, notification, Tag
} from "antd";
import Title from "antd/es/typography/Title";
import {Br} from "./Br";
import dayjs from "dayjs";
import moment from "moment";
import {SmsTaskService} from "../services/SmsTaskService";
import {CampaignService} from "../services/CampaignService";
import {useParams} from "react-router-dom";



const SearchForm = ({ onSearch }) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {
        const formData = searchForm.getFieldsValue();

        ["date_fld0_value", "date_fld1_value"].forEach((n, i) => {
            const date = formData[n];
            formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD") : "";
        });

        const queryData = ["phoneNumber", "campaignName", "packageId", "date_fld0_value", "date_fld1_value"].reduce((acc, v) => {
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
            labelCol={{ span: 15}}
            wrapperCol={{ span: 23 }}
            labelAlign="left"
        >
            <Form.Item style={{ display:'inline-block', margin:'0px'}} name="phoneNumber" label="Phone Number" children={<Input />} />
            <Form.Item name="phoneNumber_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item style={{ display:'inline-block', margin:'0px'}} name="campaignName" label="Campaign" children={<Input />} />
            <Form.Item name="campaignName_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item style={{ display:'inline-block', margin:'0px'}} name="packageId" label="Package" children={<Input />} />
            <Form.Item name="packageId_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item style={{ display:'inline-block', margin:'0px'}} name="date_fld0_value" label="From Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="date_fld0_value_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{ display:'inline-block', margin:'0px'}} name="ate_fld1_value" label="To Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="ate_fld1_value_op" initialValue={"lessThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} wrapperCol={{ offset: 4 }} colon={false} label=' '>
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

const DataView = ({ taskReports, viewPage, viewLimit}) => {

    const unixToMomentTime=(value)=>{
        if(value==null) return "";
        const parseValue = parseInt(value)
        // var dateString = moment.unix(+value).format("MM/DD/YYYY");
        const finalTime=  moment(parseValue).subtract(6, 'hours').format('YYYY-MM-DD hh:mm:ss A');
        //return dayjs(parseValue).format("MMM D, YYYY - hh:mm A")
        return finalTime;
    }
    const [modalData, setModalData] = useState(null);
    const showModal = data => setModalData(data);
    const handleOk = () => setModalData(null);
    const handleCancel = () => setModalData(null);
    function hasSubTask(task) {
        if(task.instances !=null && task.instances.indexOf(",") >= 0){
            return true;
        } else {
            return false;
        }
    }

    return (<>
        <Table
            style={{marginLeft:'6px'}}
            size="small"
            // dataSource={taskReports}
            // rowKey={"productId"}
            dataSource={(taskReports || []).map((task, i) => {
                if (!hasSubTask(task)) {
                    return { ...task, key: i };
                }

                const newTask = { ...task, key: i };

                newTask.children = task.instances.split(',').map((msgChunk, i) =>{
                    const decodedMsgChunk = atob(msgChunk);
                    return { ...task, key: i+"/"+i, message: decodedMsgChunk };
                });

                return newTask;
            })}
            locale={{ emptyText: taskReports ===null? "E": "NO DATA" }}
            pagination={false}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />
            <Table.Column title="Originating Called Number" dataIndex={"phoneNumber"}/>
            <Table.Column title="Terminating Called Number" dataIndex={"terminatingCalledNumber"}/>
            <Table.Column title="Message" dataIndex={"message"} />

            <Table.Column title="Status" dataIndex={"status"} render={v => [
                <Tag color={"processing"}>pending</Tag>,
                <Tag color={"success"}>sent</Tag>,
                <Tag color={"error"}>error</Tag>][[v === "pending", v === "sent", v === "failed"].indexOf(!0)]} />

            <Table.Column title="Status External" dataIndex={"statusExternal"} render={(v,row) => [
                <Tag></Tag>,
                <Tag color={"processing"}>pending</Tag>,
                <Tag color={"success"}>delivered</Tag>,
                <Tag color={"error"}>error</Tag>,
            ][[row.status === "failed", v === "pending" || v == null, v ==="delivered", v === "rejected" || v === "undetermined"]
                .indexOf(!0)]} />

            <Table.Column title="External Status Update Time" dataIndex={"updatedOn"} render={(unixToMomentTime)}/>

            <Table.Column title="Error" dataIndex={"errorCode"} />
            <Table.Column title="Error External" dataIndex={"errorCodeExternal"} />
            <Table.Column title="External Task Id" dataIndex={"taskIdExternal"} />
            <Table.Column title="Package" dataIndex={"packageId"} />
            <Table.Column title="Next Retry Time" dataIndex={"nextRetryTime"} render={(unixToMomentTime)} />
            <Table.Column title="Last Retry Time" dataIndex={"lastRetryTime"} render= {(unixToMomentTime)}/>

            <Table.Column
                dataIndex={""}
                render={(_, campaignTask, i) =>
                    <Button onClick={() => showModal(campaignTask)} type="primary" style={{ background:"#1890ff", borderColor:"#1890ff"}}>
                        Schedule
                    </Button>
                } />
        </Table>

        <Modal width={1000} visible={modalData !== null} onCancel={handleCancel}
               footer={[<Button style={{backgroundColor: '#FF0000', color: 'white', border: 'none'}} onClick={handleOk}>Close</Button>]} maskClosable={false} closable={false}
        >
            <Table
                dataSource={((modalData || { allRetryTimes: "" }).allRetryTimes || "")
                    .split(",").map((value,index) => (
                        {
                            key: index,
                            date: value,
                            status: 'failed',
                            errorCode: '111',
                        }
                    )) }
                rowKey={"phoneNumber"}
                locale={{ emptyText: taskReports ===null? "E": "NO DATA" }}
                pagination={false}
                style={{padding:15
                }}
            >
                <Table.Column
                    title={"#"}
                    render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
                />
                <Table.Column title="Schedule"  dataIndex={"date"} render={(unixToMomentTime)} />
                {/*<Table.Column title="Status"  dataIndex={"status"} render={v => [<Tag color={"processing"}>pending</Tag>, <Tag color={"success"}>Success</Tag>, <Tag color={"error"}>Failed</Tag>][[v === "pending", v === "success", v === "failed"].indexOf(!0)]} />
                <Table.Column title="Error Code"  dataIndex={"errorCode"} />*/}
                <Table.Column title="Retry History"  dataIndex={""} render={console.log} />


            </Table>
        </Modal>
    </>);
};

const DataPager = ({ totalPagingItems, currentPage, onPagingChange }) => {
    return (<>
        <Space align="end" direction="vertical" style={{ width: "100%" }}>
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

export const SmsHistory = () => {

    // Component States
    const [lastQuery, setLastQuery] = useState({});
    const [taskReports, setTaskReports] = useState([]);
    const [TaskReportsFetchCount, setTaskReportsFetchCount] = useState(0);
    const [taskReportsFetchError, setTaskReportsFetchError] = useState(null);


    useEffect(() => {
        CampaignService.fetchCampaignTaskReports(lastQuery)
            .then((data) => {
                console.log(data)
                setTaskReports(data.taskReports);
                setTaskReportsFetchCount(data.count);
                setTaskReportsFetchError(null);
            })
            .catch(error => {
                setTaskReports([]);
                setTaskReportsFetchCount(0);
                setTaskReportsFetchError(error);
            });
    }, [lastQuery]);

    useEffect(() => {
        setLastQuery({ page: 1, limit: 10 })
    }, []);


    return (<>
        <Row>
            <Col md={24} style={{marginLeft:'5px'}}>
                <Card title={<Title level={5}>SMS History</Title>}
                      headStyle={{backgroundColor:"#f0f2f5", border: 0,padding:'0px'}} size='small'>
                    <SearchForm onSearch={data => setLastQuery({ ...(data || {}), page: 1, limit: lastQuery.limit })}/>
                </Card>
            </Col>
        </Row>
        <DataView taskReports={taskReports} viewPage={lastQuery.page} viewLimit={lastQuery.limit}/>
        <Br />
        <DataPager totalPagingItems={TaskReportsFetchCount} currentPage={lastQuery.page}
                              onPagingChange={(page, limit) => setLastQuery({ ...lastQuery, page, limit })} />
    </>);
};
