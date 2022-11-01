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
    Modal, Typography, DatePicker, notification, Tooltip, Upload, message, Checkbox, TimePicker, Descriptions, Tag
} from "antd";
import Title from "antd/es/typography/Title";
import {Br} from "./Br";
import dayjs from "dayjs";
import {ProductService} from "../services/ProductService";
import {CampaignService} from "../services/CampaignService";
import {FileDoneOutlined, FileTextOutlined, FileTextTwoTone, PlusCircleFilled} from "@ant-design/icons";
import * as sheetjs from "xlsx";
import {Link} from "react-router-dom";
import {SenderIdService} from "../services/SenderIdService";
import {unflatten} from "../Util";
import moment from 'moment';


const SearchForm = ({ onSearch }) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {
        const formData = searchForm.getFieldsValue();

        ["cratedOn_fld0_value", "cratedOn_fld1_value"].forEach((n, i) => {
            const date = formData[n];
            formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD HH:mm:ss") : null;

            if (formData[n] === null) {
                delete formData[n];
            }
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
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="cratedOn_fld0_value" label="From Date" children={<DatePicker showTime use12Hours={true} format="YYYY-MM-DD HH:mm:ss" />} />
            <Form.Item name="cratedOn_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="cratedOn_fld1_value" label="To Date" children={<DatePicker showTime use12Hours={true} format="YYYY-MM-DD HH:mm:ss" />} />
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
    if (type === 'start-end') return (<>
        <Row>
            <Col md={12}>
                <Form.Item name="schedule.props.scheduleStart">
                    <DatePicker placeholder="Start Date" showTime use12Hours={true} format="YYYY-MM-DD HH:mm:ss"/>
                </Form.Item>
            </Col>
            <Col md={12}>
                <Form.Item name="schedule.props.scheduleEnd">
                    <DatePicker placeholder="End Date" showTime use12Hours={true} format="YYYY-MM-DD HH:mm:ss"/>
                </Form.Item>
            </Col>
        </Row>
    </>);
    if (type === 'start-end,active-hours') return (<>
        <Row>
            <Descriptions title="Date">
                <Descriptions.Item label="Start-Date" span={1} labelStyle={{ alignItems:'start'}}>
                    <Form.Item name="schedule.props.scheduleStart">
                        <DatePicker placeholder="Start Date"/>
                    </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label="End-Date" span={1} labelStyle={{ alignItems:'start'}}>
                    <Form.Item name="schedule.props.scheduleEnd">
                        <DatePicker placeholder="End Date"/>
                    </Form.Item>
                </Descriptions.Item>
            </Descriptions>
        </Row>
        <Row>
            <Descriptions title="Active Hours" Layout="vertical" >
                <Descriptions.Item label="Start at" span={1} labelStyle={{ alignItems:'start'}}>
                    <Form.Item name="schedule.props.activeHourStart">
                        <TimePicker placeholder="Start Time" />
                    </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label="End at" span={1} labelStyle={{ alignItems:'start'}}>
                    <Form.Item name="schedule.props.activeHourEnd">
                        <TimePicker placeholder="End Time"/>
                    </Form.Item>
                </Descriptions.Item>
            </Descriptions>
        </Row>
        <Row>
            <Descriptions title="Exclude Hours" Layout="vertical" >
                <Descriptions.Item label="Start at" span={1} labelStyle={{ alignItems:'start'}}>
                    <Form.Item name="schedule.props.inactiveHourStart">
                        <TimePicker placeholder="Start Time"/>
                    </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label="End at" span={1} labelStyle={{ alignItems:'start'}}>
                    <Form.Item name="schedule.props.inactiveHourEnd">
                        <TimePicker placeholder="End Time"/>
                    </Form.Item>
                </Descriptions.Item>
            </Descriptions>
        </Row>
    </>);
};

const WriteForm = ({record, onRecordSaved,close }) => {
    const { Option } = Select;
    const [writeForm] = Form.useForm();

    const [senderIds, setSenderIds] = useState([]);
    useEffect(()=> {
        SenderIdService.fetchRecords({})
            .then(data=>{
                setSenderIds(data.senderIds);
            })
    },[])

    useEffect(() => writeForm.resetFields(), [record, writeForm]);
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
            onFinish={() => writeForm.resetFields()}
        >
            <Form.Item name="campaignName" label="Campaign Name" rules={[{ required: true }]} children={<Input />} />

            <Form.Item name="senderId" label="Sender ID" rules={[{ required: true }]}>
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
            <Form.Item name="schedule.policy" id="selected" label="Schedule Policy" initialValue={type}>
                <Select onChange={setType}>
                    <Option value="default">Default (Schedule On)</Option>
                    <Option value="start-end">Start-End Date</Option>
                    <Option value="start-end,active-hours">Start-End Date, Active-hours</Option>
                </Select>
            </Form.Item>
            <Form.Item colon={false} label=" " style={{ marginTop:'0px' }}>
                <Col style={{borderStyle:"solid", padding:5,borderColor:'lightgray'}}>
                <SchedulePickerWithType type={type}/>
                </Col>
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
                                delete formDataUf.schedule;
                                formDataUf.schedules = [window.btoa(JSON.stringify(schedule))].join(",");

                                return CampaignService.saveCampaign(formDataUf);
                            })
                            .then(campaign => {
                                onRecordSaved(campaign);
                                notification.success({
                                    key: `corder_${Date.now()}`,
                                    message: "Task Complete",
                                    description: <>Campaign created: {campaign.campaignId}</>,
                                    duration: 5
                                });
                            })
                            // .catch(error => {alert(error.message)}))
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

const DataView = ({ campaigns, viewPage, viewLimit, onView}) => {

    const getCampaignStatus = (campaign) => {
        if (campaign.pendingTaskCount === 0){
            return <Tag color={"success"}>Finished</Tag>
        }
    }

    return (<>
        <Table
            style={{marginLeft:'6px'}}
            size="small"
            dataSource={campaigns}
            rowKey={"campaignId"}
            locale={{ emptyText: campaigns ===null? "E": "NO DATA" }}
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
                        <Link to={`/messaging/campaign/${campaign.campaignId}`}>{campaign.campaignId}</Link>
                    );
                }}
            />

            <Table.Column title="Campaign Name" dataIndex={"campaignName"} />
            <Table.Column title="Campaign Status" render={getCampaignStatus} />
            <Table.Column title="Sender" dataIndex={"senderId"} />
            <Table.Column title="Message" dataIndex={"message"} width={"25vw"}/>
            <Table.Column title="Sent" dataIndex={"sentTaskCount"} render={v => v || 0} />
            <Table.Column title="Failed" dataIndex={"failedTaskCount"} render={v => v || 0} />
            <Table.Column title="Pending" dataIndex={"pendingTaskCount"} render={v => v || 0} />
            <Table.Column title="Total Tasks" dataIndex={"totalTaskCount"} />
            <Table.Column title="Date" dataIndex={"createdOn"} render={date => dayjs(date).format("MMM D, YYYY - hh:mm A")} />
        </Table>
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

export const CampaignNew = () => {

    // Component States
    const [lastQuery, setLastQuery] = useState({});
    const [campaigns, setCampaigns] = useState([]);
    const [CampaignsFetchCount, setCampaignsFetchCount] = useState(0);
    const [CampaignsFetchError, setCampaignsFetchError] = useState(null);

    const [modalData, setModalData] = useState(null);
    const showModal = data => setModalData(data);
    const handleOk = () => setModalData(null);
    const handleCancel = () => setModalData(null);


    useEffect(() => {
        CampaignService.fetchCampaigns(lastQuery)
            .then((data) => {
                console.log(data)
                setCampaigns(data.campaigns);
                setCampaignsFetchCount(data.count);
                setCampaignsFetchError(null);
            })
            .catch(error => {
                setCampaigns([]);
                setCampaignsFetchCount(0);
                setCampaignsFetchError(error);
            });
    }, [lastQuery]);

    useEffect(() => {
        setLastQuery({ page: 1, limit: 10 })
    }, []);


    return (<>
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
                    <SearchForm onSearch={data => setLastQuery({ ...(data || {}), page: 1, limit: lastQuery.limit, orderBy: lastQuery.orderBy })}/>
                </Card>
            </Col>
            <Modal width={1000} header="Create Campaign" key="createCampaign" visible={modalData} footer={null} maskClosable={false} closable={false} style={{ top: 20 }} bodyStyle={{height:"55rem"}}>
                <WriteForm close={handleCancel} record={modalData} onRecordSaved={_ => setLastQuery({ ...lastQuery, orderBy: "updatedOn DESC", page: 1 })} />
            </Modal>
        </Row>
        <DataView campaigns={campaigns} viewPage={lastQuery.page} viewLimit={lastQuery.limit}/>
        <Br />
        <DataPager totalPagingItems={CampaignsFetchCount} currentPage={lastQuery.page}
                              onPagingChange={(page, limit) => setLastQuery({ ...lastQuery, page, limit })} />
    </>);
};
