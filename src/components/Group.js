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
    Modal, DatePicker, notification, Tooltip, Upload, message, Checkbox, TimePicker, Descriptions
} from "antd";
import Title from "antd/es/typography/Title";
import {Br} from "./Br";
import dayjs from "dayjs";
import {CampaignService} from "../services/CampaignService";
import {FileDoneOutlined, FileTextOutlined, FileTextTwoTone, PlusCircleFilled} from "@ant-design/icons";
import * as sheetjs from "xlsx";
import {Link} from "react-router-dom";
import {GroupService} from "../services/ContactBook/GroupService";



const SearchForm = ({ onSearch }) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {
        const formData = searchForm.getFieldsValue();

        // ["cratedOn_fld0_value", "cratedOn_fld1_value"].forEach((n, i) => {
        //     const date = formData[n];
        //     formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD") : "";
        // });

        const queryData = ["groupName", "cratedOn_fld0_value", "cratedOn_fld1_value"].reduce((acc, v) => {
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
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="groupName" label="Group Name" children={<Input />} />
            <Form.Item name="groupName_op" initialValue={"contains"} hidden children={<Input />} />
            {/*<Form.Item style={{display:'inline-block', margin:'0px'}} name="cratedOn_fld0_value" label="From Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="cratedOn_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="cratedOn_fld1_value" label="To Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="cratedOn_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input />} />*/}
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

const WriteForm = ({ record, onRecordSaved,close }) => {
    const { Option } = Select;
    const [writeForm] = Form.useForm();

    useEffect(() => writeForm.resetFields(), [record, writeForm]);

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
            <Form.Item name="groupId" label="Group ID" rules={[{ required: false }]} hidden children={<Input />} />
            <Form.Item name="groupName" label="Group Name" rules={[{ required: true }]} children={<Input />} />

            <Form.Item wrapperCol={{ offset: 15 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    onClick={() => writeForm
                        .validateFields()
                        .then(_ => writeForm
                            .validateFields()
                            .then(_ => GroupService.saveRecord(writeForm.getFieldsValue()))
                            .then(groups => {
                                // alert(groups);
                                onRecordSaved(groups);
                                notification.success({
                                    key: `cgroup_${groups.groupId}`,
                                    message: "Task Complete",
                                    description: <>Group Saved: {groups.groupId}</>,
                                    duration: 5
                                });
                            })
                            // .catch(error => {alert(error.message)}))
                            .catch(error => {
                                notification.error({
                                    key: `cgroup_${Date.now()}`,
                                    message: "Task Failed",
                                    description: <>Error creating group.<br />{error.message}</>,
                                    duration: 5
                                });
                            }))
                        .catch(_ => { })
                    }
                    children={"Submit"}
                />
                <Button style={{backgroundColor: '#FF0000', color: 'white', border: 'none',marginLeft:5}} onClick={close}>Close</Button>
            </Form.Item>
        </Form>
    </>);
};

const DataView = ({ groups, viewPage, viewLimit, onView}) => {

    return (<>
        <Table
            style={{marginLeft:'6px'}}
            size="small"
            dataSource={groups}
            rowKey={"groupId"}
            locale={{ emptyText: groups ===null? "E": "NO DATA" }}
            pagination={false}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />
            <Table.Column
                title="Group ID"
                dataIndex={"groupId"}
                render={(_, groups, i) => {
                    return (
                        <Link to={`/contactBook/groups/${groups.groupId}`}>{groups.groupId}</Link>
                        // <Button onClick={() => onView(campaign)} type="link">{campaign.campaignId}</Button>
                    );
                }}
            />

            <Table.Column title="Group Name" dataIndex={"groupName"} />
            {/*<Table.Column title="Party ID" dataIndex={"partyId"} />*/}
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

export const Groups = () => {

    // Component States
    const [lastQuery, setLastQuery] = useState({});
    const [groups, setGroups] = useState([]);
    const [groupsFetchCount, setGroupsFetchCount] = useState(0);
    const [groupsFetchError, setGroupsFetchError] = useState(null);

    const [modalData, setModalData] = useState(null);
    const showModal = data => setModalData(data);
    const handleOk = () => setModalData(null);
    const handleCancel = () => setModalData(null);


    useEffect(() => {
        GroupService.fetchRecords(lastQuery)
            .then((data) => {
                console.log(data)
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


    return (<>
        <Row >
            <Col md={24} style={{marginLeft:'5px'}}>
                <Card title={<Title level={5}>Groups</Title>}
                      headStyle={{backgroundColor:"#f0f2f5", border: 0,padding:'0px'}}
                      size="small"
                      extra={
                          <Button type="primary" style={{ background:"#1890ff", borderColor:"#1890ff"}} icon={<PlusCircleFilled />} onClick={showModal}>
                              Create Group
                          </Button>}
                >
                    <SearchForm onSearch={data => setLastQuery({ ...(data || {}), page: 1, limit: lastQuery.limit })}/>
                </Card>
            </Col>
            <Modal key="createGroup" visible={modalData} footer={null} onCancel={handleCancel} maskClosable={false} closable={false} style={{ top: 20 }}>
                <WriteForm record={modalData} onRecordSaved={_ => setLastQuery({ ...lastQuery, orderBy: "updatedOn DESC", page: 1 })} close={handleCancel} />
            </Modal>
        </Row>
        <DataView groups={groups} viewPage={lastQuery.page} viewLimit={lastQuery.limit}/>
        <Br />
        <DataPager totalPagingItems={groupsFetchCount} currentPage={lastQuery.page}
                   onPagingChange={(page, limit) => setLastQuery({ ...lastQuery, page, limit })} />
    </>);
};
