import { useEffect, useRef, useState } from "react";
import { useActor } from "@xstate/react";
import { Col, Row, Form, Input, Button, Table, Space, Pagination, Typography, DatePicker, notification, Checkbox, Tooltip, Collapse, Card, Breadcrumb, List, Divider, Statistic, Tag, Select, Modal, Spin, Upload, message,TimePicker,Descriptions } from "antd";
import { PlusCircleFilled } from '@ant-design/icons';
import moment from 'moment';
import dayjs from "dayjs";
import { Br } from "./Br";
import { FileDoneOutlined, FileTextOutlined, FileTextTwoTone } from "@ant-design/icons";
import { Inventory } from "../services/Inventory";
import { SmsTask as SmsTaskSvc } from "../services/SmsTask";
import { Campaign as CampaignSvc } from "../services/Campaign";
import * as sheetjs from "xlsx";
import {TaskSearchForm} from "./TaskSearch";

const SearchForm = ({ onSearch }) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {
        const formData = searchForm.getFieldsValue();

        ["cratedOn_fld0_value", "cratedOn_fld1_value"].forEach((n, i) => {
            const date = formData[n];
            formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD") : "";
        });

        const queryData = ["campaignName", "cratedOn_fld0_value", "cratedOn_fld1_value"].reduce((acc, v) => {
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
            labelCol={{ span: 22 }}
            wrapperCol={{ span: 23 }}
            labelAlign="left"
        >
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="campaignName" label="Campaign Name" children={<Input />} />
            <Form.Item name="campaignName_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="cratedOn_fld0_value" label="From Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="cratedOn_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="cratedOn_fld1_value" label="To Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="cratedOn_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input />} />
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

const {Option} = Select;
const SchedulePickerWithType = ({type}) => {
    if (type === 'default') return (<>
        <Row>
            <Col md={12}>
                <Form.Item name="pickedSchedule_time">
                    <TimePicker />
                </Form.Item>
            </Col>
            <Col md={12}>
                <Form.Item name="pickedSchedule_date">
                    <DatePicker />
                </Form.Item>
            </Col>
        </Row>
    </>);
    if (type === 'start&end_date') return (<>
        <Row>
            <Col md={12}>
                <Form.Item name="pickedSchedule_start_date">
                    <DatePicker placeholder="Start Date"/>
                </Form.Item>
                {/*<DatePicker placeholder="start-date"/>*/}
            </Col>
            <Col md={12}>
                <Form.Item name="pickedSchedule_end_date">
                    <DatePicker placeholder="End Date"/>
                </Form.Item>
            </Col>
        </Row>
    </>);
    if (type === 'start_end_date&hours') return (<>
        <Row>
            <Descriptions title="Date">
             <Descriptions.Item label="Start-Date" span={1} labelStyle={{ alignItems:'start'}}>
                 <Form.Item name="pickedSchedule_start_date">
                     <DatePicker placeholder="Start Date"/>
                 </Form.Item>
                 {/*<DatePicker placeholder="start-date"/>*/}
             </Descriptions.Item>
             <Descriptions.Item label="End-Date" span={1} labelStyle={{ alignItems:'start'}}>
                 <Form.Item name="pickedSchedule_end_date">
                     <DatePicker placeholder="End Date"/>
                 </Form.Item>
                 {/*<DatePicker placeholder="end-date"/>*/}
             </Descriptions.Item>
            </Descriptions>
        </Row>
        <Row>
            <Descriptions title="Active Hours" Layout="vertical" >
                <Descriptions.Item label="Start at" span={1} labelStyle={{ alignItems:'start'}}>
                    <Form.Item name="pickedSchedule_start_time">
                        <TimePicker placeholder="Start Time" />
                    </Form.Item>
                    {/*<TimePicker style={{width:160}} placeholder="select-time"/>*/}
                </Descriptions.Item>
                <Descriptions.Item label="End at" span={1} labelStyle={{ alignItems:'start'}}>
                    <Form.Item name="pickedSchedule_end_time">
                        <TimePicker placeholder="End Time"/>
                    </Form.Item>
                    {/*<TimePicker style={{width:160}} placeholder="select-time" />*/}
                </Descriptions.Item>
            </Descriptions>
        </Row>
        <Row>
            <Descriptions title="Exclude Hours" Layout="vertical" >
                <Descriptions.Item label="Start at" span={1} labelStyle={{ alignItems:'start'}}>
                    <Form.Item name="pickedSchedule_exclude_start_time">
                        <TimePicker placeholder="Start Time"/>
                    </Form.Item>
                    {/*<TimePicker style={{width:160}} placeholder="select-time"/>*/}
                </Descriptions.Item>
                <Descriptions.Item label="End at" span={1} labelStyle={{ alignItems:'start'}}>
                    <Form.Item name="pickedSchedule_exclude_end_time">
                        <TimePicker placeholder="End Time"/>
                    </Form.Item>
                    {/*<TimePicker style={{width:160}} placeholder="select-time" />*/}
                </Descriptions.Item>
            </Descriptions>
        </Row>
    </>);
    // return <DatePicker picker={type}={onChange} />;
};

const EditForm = ({ form, record, onSave }) => {
    const [editForm] = Form.useForm(form);
    const [type, setType] = useState('default');

    return (<>
        <Form
            form={editForm}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 20 }}
            labelAlign={"left"}
            style={{
                padding:'35px'
            }}
        >
            <Form.Item name="campaignName" label="Campaign Name" rules={[{ required: true }]} children={<Input />} />

            <Form.Item name="senderId" label="Sender ID" rules={[{ required: true }]} initialValue={"8801552146283"} children={<Input />} />

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
                                    editForm.setFieldsValue({ ...editForm.getFieldsValue, phoneNumbers: info.file.response.join(", ") })
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
                rules={[{ required: true }]}
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
            <Form.Item name="selectedPolicy" id="selected" label="Schedule Policy" initialValue={type}>
                    <Select onChange={setType} >
                        <Option value="default">Default</Option>
                        <Option value="start&end_date">Start Date-End Date</Option>
                        <Option value="start_end_date&hours">Start Date-End Date,Active-hours</Option>
                    </Select>
            </Form.Item>
            <Form.Item
                id="schedule"
                colon={false}
                label=" "
                style={{
                    marginTop:'0px'
                }}
                >
                    <SchedulePickerWithType type={type}/>
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

            <Form.Item wrapperCol={{ offset: 8 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    onClick={() => editForm
                        .validateFields()
                        .then(_ => onSave(editForm.getFieldsValue()))
                        .catch(_ => { })
                    }
                    children={"Submit"}
                />
            </Form.Item>
        </Form>
    </>);
};

const DataView = ({ context, viewPage, viewLimit, onView, onEdit, onDelete }) => {
    const viewResult = context.result;
    const viewError = context.error;

    return (<>
        <Table
            style={{marginLeft:'6px'}}
            size="small"
            dataSource={viewResult.campaigns}
            rowKey={"campaignId"}
            locale={{ emptyText: viewError && `[ ${viewError.message} ]` }}
            pagination={false}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />

            <Table.Column
                title="Campaign ID"
                dataIndex={undefined}
                render={(_, campaign, i) => {
                    return (
                        <Button onClick={() => onView(campaign)} type="link">{campaign.campaignId}</Button>
                    );
                }}
            />

            <Table.Column title="Campaign Name" dataIndex={"campaignName"} />
            <Table.Column title="Sender" dataIndex={"senderId"} />
            <Table.Column title="Message" dataIndex={"message"} />
            <Table.Column title="Sent" dataIndex={"sentTaskCount"} render={v => v || 0} />
            <Table.Column title="Failed" dataIndex={"failedTaskCount"} render={v => v || 0} />
            <Table.Column title="Pending" dataIndex={"pendingTaskCount"} render={v => v || 0} />
            <Table.Column title="Total Tasks" dataIndex={"totalTaskCount"} />
            <Table.Column title="Date" dataIndex={"createdOn"} render={date => dayjs(date).format("MMM D, YYYY - hh:mm A")} />
        </Table>
    </>);
};

const FilterTaskDataPager = ({ totalPagingItems, currentPage, onPagingChange }) => {
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
const DataViewSingle = ({ context, onCampaignStart, onDeleteTask, onFilterTasks }) => {
    const viewResult = context.result;
    const viewError = context.error;
    const { Title } = Typography;


    return (<>
        <Card bordered={false} bodyStyle={{ padding: 0 }}>
            <List
                header={<Typography.Text strong>
                    <span>Campaign Overview</span>
                    &nbsp;
                    <Tag >{viewResult.campaign.campaignId}</Tag>
                </Typography.Text>}
                footer={<Space>
                    <Button
                        type="primary"
                        onClick={() => onCampaignStart({ campaignId: viewResult.campaign.campaignId })}
                        children={"Start Campaign"}
                        disabled={viewResult.campaign.createdOn !== viewResult.campaign.updatedOn}
                    />
                </Space>}
                size="large"
                bordered
            >
                <Card bordered={false} style={{margin:"0px"}}>
                    <Space split={<Divider type="vertical" style={{height:"18vh"}} />} size={"large"} style={{alignItems:'start'}}>
                        <div
                            children={
                                [
                                    ["campaignName", "Campaign Name"],
                                    ["createdOn", "Date", d => dayjs(d).format("MMM D, YYYY - hh:mm A")],
                                    ["message", "Message"]
                                ].map(([k, l, toValue = v => v]) => (<Row gutter={[10]} key={k}>
                                    <Col><Typography.Paragraph strong>{l}</Typography.Paragraph></Col>
                                    <Col>&nbsp;:&nbsp;</Col>
                                    <Col><Typography.Text>{toValue(viewResult.campaign[k])}</Typography.Text></Col>
                                </Row>))
                            }
                        />
                        <List
                            grid={{ gutter: 24 }}
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
                                    value={toValue(viewResult.campaign[key])}
                                    key={key}
                                />
                            </Col>))}
                        />
                    </Space>
                </Card>
            </List>
        </Card>

        <Card title={<Title style={{marginLeft:12}} level={5}>Search Task</Title>}
              headStyle={{/*backgroundColor:"#f0f2f5",*/ border: 0,padding:'0px'}}
              size="small"
        >
            <TaskSearchForm  onSearch={data => onFilterTasks({ campaignId: viewResult.campaign.campaignId, ...data })}/>
        </Card>

        <Card title="Campaign Tasks">
            <Table
                size="small"
                dataSource={viewResult.tasks}
                rowKey={"phoneNumber"}
                locale={{ emptyText: viewError && `[ ${viewError.message} ]` }}
                pagination={false}
                style={{paddingBottom:8}}
            >
                <Table.Column
                    dataIndex={undefined}
                    title={"#"}
                    render={(_, __, i) => (/*viewPage*/1 - 1) * /*viewLimit*/10 + (++i)}
                />

                <Table.Column title="Phone Number" dataIndex={"phoneNumber"} />
                <Table.Column title="Task Status" dataIndex={"status"} render={v => [<Tag color={"processing"}>pending</Tag>, <Tag color={"success"}>sent</Tag>, <Tag color={"error"}>error</Tag>][[v === "pending", v === "sent", v === "failed"].indexOf(!0)]} />
                <Table.Column title="Status Message" dataIndex={undefined} render={(v, r, i) => (r.statusExternal && "sent") || (r.errorCode || r.errorCodeExternal)} />
                <Table.Column title="Pakcage" dataIndex={"packageId"} />

                <Table.Column
                    dataIndex={undefined}
                    render={(_, campaignTask, i) => <Button onClick={_ => onDeleteTask(viewResult.campaign, campaignTask)} type="primary" disabled={campaignTask.status === "sent"}>Delete</Button>}
                />
            </Table>
            {/*<FilterTaskDataPager totalPagingItems={50} />*/}
        </Card>

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

export const Campaign = ({ actor: [lookupActor, saveActor, previewActor] }) => {
    const [lookupState, sendLookup] = useActor(lookupActor);
    const [saveState, sendSave] = useActor(saveActor);
    const [previewState, sendPreview] = useActor(previewActor);

    const [editForm] = Form.useForm();
    const [previewing, setPreviewing] = useState(false);
    const [saving, setSaving] = useState(false);
    // const [campaignPackages, setCampaignPackages] = useState(null);

    const sendPagedQuery = queryData => (page, limit) => {
        page === undefined && (page = queryData.page)
        limit === undefined && (limit = queryData.limit)
        console.log(queryData, page, limit);

        const query = { data: { ...queryData, page, limit }, type: "LOAD" };
        return sendLookup(query);
    };

    const sendPagedQueryTask = queryData => (page, limit) => {
        page === undefined && (page = queryData.page)
        limit === undefined && (limit = queryData.limit)
        console.log(queryData, page, limit);

        const query = { data: { ...queryData, page, limit }, type: "LOAD" };
        return sendPreview(query);
    };

    const saveRecord = data => {
        console.log(data);
        return sendSave({ data, type: "LOAD" });
    };

    const loadPreview = data => sendPreview({
        type: "LOAD", data
    });

    const sendSms = campaign => setSaving(true) || SmsTaskSvc
        .sendSms({}, { data: campaign })
        .then(result => {
            notification.success({
                key: `send_${Date.now()}`,
                message: "Task Finished",
                description: <>
                    {JSON.stringify(result)}
                </>,
                duration: 5
            });
        })
        .then(() => {
            loadPreview({ ...campaign, type: "LOAD" });
        })
        .catch(error => {
            notification.error({
                key: `send_${Date.now()}`,
                message: "Task Failed",
                description: <>
                    Error sending SMS.<br />{JSON.stringify(error)}
                </>,
                duration: 5
            });
        })
        .finally(_ => setSaving(false));

    const deleteTask = (campaign, task) => CampaignSvc
        .removeCampaignTask({}, { data: task })
        .then(result => {
            notification.success({
                key: `dtask_${Date.now()}`,
                message: "Task Finished",
                description: <>
                    {JSON.stringify(result)}
                </>,
                duration: 5
            });
        })
        .then(() => {
            loadPreview({ ...campaign, type: "LOAD" });
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
        });

    useEffect(() => sendPagedQuery(lookupState.context.payload.data)(), []);

    // useEffect(() => {
    //     Inventory
    //         .fetchProducts({}, { data: {} })
    //         .then(data => console.log("fetched inventory", data) || data)
    //         .then(data => setCampaignPackages(data.products))
    //         .catch(error => console.log("error fetching inventory", error));
    // }, [])

    useEffect(() => {
        saveActor.subscribe(state => {
            const lookupContext = lookupActor.getSnapshot().context;
            const saveContext = saveActor.getSnapshot().context;

            if (state.matches("hasResult")) {
                sendPagedQuery({ ...lookupContext.payload.data, orderBy: "campaignId DESC" })();

                notification.success({
                    key: `save_${Date.now()}`,
                    message: "Task Complete",
                    description: <>Campaign created: {saveContext.result.campaignId}</>,
                    duration: 5
                });

                editForm.resetFields();
            }

            if (state.matches("hasError")) {
                notification.error({
                    key: `save_${Date.now()}`,
                    message: "Task Failed",
                    description: <>Error creating campaign.<br />{state.context.error.message}</>,
                    duration: 5
                });
            }
        });
    }, [editForm]);

    useEffect(() => {
        if (lookupState.matches("idle")) {
            if (lookupState.context.result.count > 0 && lookupState.context.result.campaigns.length === 0) {
                lookupState.context.payload.data.page--;
                sendLookup({ ...lookupState.context.payload, type: "LOAD" });
            }
        }
    }, [lookupState]);

    useEffect(() => {
        if (previewing) {
            const interval = setInterval(() => {
                const context = previewActor.getSnapshot().context;
                loadPreview(context.payload.data);
            }, 5000);

            return interval;
        } else {
            const interval = setInterval(() => {
                const context = lookupActor.getSnapshot().context;
                sendPagedQuery(context.payload.data)();
            }, 5000);

            return interval;
        }
    }, [previewing]);

    const onClickView = data => console.log("view", data) || loadPreview({ campaignId: data.campaignId }) || setPreviewing(true);
    const onClickEdit = data => console.log("edit", data);
    const onClickDelete = data => console.log("delete", data);

    const viewContext = lookupState.context;

    const viewPage = viewContext.payload.data.page;
    const viewLimit = viewContext.payload.data.limit;

    const [isModalVisible, setIsModalVisible] = useState(false);
    const showModal = () => {
        setIsModalVisible(true);
    };
    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };
    const { Title } = Typography;

    return (<>
        <Breadcrumb>
            <Breadcrumb.Item>
                {previewing}
                {previewing && <Button type="link" style={{ padding: 0 }} onClick={() => sendPagedQuery(viewContext.payload.data)() || setPreviewing(false)}>Campaign</Button>}
            </Breadcrumb.Item>
            {previewing && <Breadcrumb.Item>
                {previewState.context.result.campaign.campaignName}
            </Breadcrumb.Item>}
        </Breadcrumb>
        {previewing || <div>
            <Row >
                <Col md={24} style={{marginLeft:'5px'}}>
                    <Card title={<Title level={5}>Campaign</Title>}
                          headStyle={{backgroundColor:"#f0f2f5", border: 0,padding:'0px'}}
                          size="small"
                          extra={
                              <Button type="primary" style={{ background:"#1890ff", borderColor:"#1890ff"}} icon={<PlusCircleFilled />} onClick={showModal}>
                                  Create Campaign
                              </Button>}
                    >
                        <SearchForm onSearch={data => sendPagedQuery(data)(1, viewLimit)} />
                    </Card>
                </Col>
                    <Modal width={1000} header="Create Campaign" key="createCampaign" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                        <EditForm form={editForm} record={{}} onSave={saveRecord} />
                    </Modal>
            </Row>
            <DataView context={viewContext} onView={onClickView} onEdit={onClickEdit} onDelete={onClickDelete} viewPage={viewPage} viewLimit={viewLimit} />
            <Br />
            <DataPager totalPagingItems={viewContext.result.count} currentPage={viewPage} onPagingChange={sendPagedQuery(viewContext.payload.data)} />
        </div>}
        {previewing &&(<> <DataViewSingle context={previewState.context} onCampaignStart={sendSms} onDeleteTask={deleteTask} onFilterTasks={loadPreview} />
         <FilterTaskDataPager totalPagingItems={previewState.context.payload.data.count} currentPage={previewState.context.payload.data.page} onPagingChange={sendPagedQueryTask(previewState.context.payload.data)}/> </> )}
        <Modal visible={saving} footer={null} closable="false" maskClosable={false}>
            <Spin tip="Sending Request" />
        </Modal>
    </>);
};
