import { useEffect, useRef, useState } from "react";
import { useActor } from "@xstate/react";
import { Col, Row, Form, Input, Button, Table, Space, Pagination, Typography, DatePicker, notification, Checkbox, Tooltip, Collapse, Card, Breadcrumb, List, Divider, Statistic, Tag, Select } from "antd";
import dayjs from "dayjs";
import { Br } from "./Br";
import { FileDoneOutlined, FileTextOutlined } from "@ant-design/icons";
import { Inventory } from "../services/Inventory";
import { SmsTask } from "../services/SmsTask";


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
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 8 }}
            labelAlign="left"
        >
            <Form.Item name="campaignName" label="Campaign Name" children={<Input />} />
            <Form.Item name="campaignName_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item name="cratedOn_fld0_value" label="From Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="cratedOn_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
            <Form.Item name="cratedOn_fld1_value" label="To Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="cratedOn_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input />} />
            <Form.Item wrapperCol={{ offset: 5 }}>
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

const EditForm = ({ form, record, onSave }) => {
    const [editForm] = Form.useForm(form);

    return (<>
        <Form
            form={editForm}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            labelAlign={"left"}
            initialValues={{ senderId: "8801552146283", isUnicode: true }}
        >
            <Form.Item name="campaignName" label="Campaign Name" rules={[{ required: true }]} children={<Input />} />

            <Form.Item name="senderId" label="Sender ID" rules={[{ required: true }]} children={<Input />} />

            <Form.Item
                name="phoneNumbers"
                label={<>
                    <span>Contacts</span>
                    &nbsp;
                    &nbsp;
                    <Tooltip title="Import (Excel, CSV, Text)"><Button shape="circle" icon={<FileTextOutlined />} /></Tooltip>
                </>}
                rules={[{ required: true }]}
                children={<Input.TextArea />}
            />

            <Form.Item
                name="message"
                label={<>
                    <span>Message Text</span>
                    &nbsp;
                    &nbsp;
                    <Space>
                        <Tooltip title="Import Draft"><Button shape="circle" icon={<FileTextOutlined />} /></Tooltip>
                        <Tooltip title="Import Template"><Button shape="circle" icon={<FileDoneOutlined />} /></Tooltip>
                    </Space>
                </>}
                rules={[{ required: true }]}
                children={<Input.TextArea />}
            />

            <Form.Item wrapperCol={{ offset: 8 }}>
                <Space>
                    <Form.Item name="isUnicode" valuePropName="checked" style={{ margin: 0 }}>
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
            <Table.Column title="Pending" dataIndex={"pending"} render={v => v || 0} />
            <Table.Column title="Complete" dataIndex={"complete"} render={v => v || 0} />
            <Table.Column title="Total Tasks" dataIndex={"taskTotal"} />
            <Table.Column title="Date" dataIndex={"createdOn"} render={date => dayjs(date).format("DD-MM-YYYY")} />
        </Table>
    </>);
};

const DataViewSingle = ({ context, campaignPackages, onRunCampaign }) => {
    const viewResult = context.result;
    const viewError = context.error;

    const [campaignPackage, setCampaignPackage] = useState(campaignPackages ? campaignPackages[0].productId : null);

    return (<>
        <Card bordered={false} bodyStyle={{ padding: 0 }}>
            <List
                header={<Typography.Text strong>
                    <span>Campaign Overview</span>
                    &nbsp;
                    <Tag >{viewResult.campaign.campaignId}</Tag>
                </Typography.Text>}
                footer={<Space>
                    {campaignPackage && <Select onChange={setCampaignPackage} defaultValue={campaignPackage} style={{ minWidth: 150 }}>
                        {campaignPackages.map((v, i) => <Select.Option value={v.productId} key={i}>{v.productName}</Select.Option>)}
                    </Select>}
                    <Button
                        type="primary"
                        onClick={() => onRunCampaign({ campaignId: viewResult.campaign.campaignId, campaignPackage })}
                        children={"Run Pending Tasks"}
                        disabled={!campaignPackage || viewResult.campaign.pending <= 0}
                    />
                    {campaignPackage ? null : <Typography.Text type="warning" italic>Please buy a package !</Typography.Text>}
                </Space>}
                size="large"
                bordered
            >
                <Card bordered={false}>
                    <Space direction="vertical" size={"large"}>
                        <div
                            children={
                                [
                                    ["campaignName", "Campaign Name"],
                                    ["createdStamp", "Date", d => dayjs(d).format("DD-MM-YYYY")],
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
                                    ["complete", "Complete", "success", v => v || 0],
                                    ["pending", "Pending", "warning", v => v || 0],
                                    ["taskTotal", "Total Task", "danger", v => v],
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
                <Divider style={{ margin: 0 }} />
            </List>
        </Card>

        <Typography.Text>&nbsp;</Typography.Text>

        <Card title="Campaign Tasks">
            <Table
                size="small"
                dataSource={viewResult.tasks}
                rowKey={"phoneNumber"}
                locale={{ emptyText: viewError && `[ ${viewError.message} ]` }}
                pagination={true}
            >
                <Table.Column
                    dataIndex={undefined}
                    title={"#"}
                    render={(_, __, i) => (/*viewPage*/1 - 1) * /*viewLimit*/10 + (++i)}
                />

                <Table.Column title="Phone Number" dataIndex={"phoneNumber"} />
                <Table.Column title="Task Status" dataIndex={"status"} render={status => status > 0 ? <Tag color={"success"}>complete</Tag> : <Tag color={"processing"}>pending</Tag>} />

                <Table.Column
                    dataIndex={undefined}
                    render={(_, campaignTask, i) => <Button onClick={_ => console.log(campaignTask)} type="primary">Delete</Button>}
                />
            </Table>
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
    const [campaignPackages, setCampaignPackages] = useState(null);

    const sendPagedQuery = queryData => (page, limit) => {
        page === undefined && (page = queryData.page)
        limit === undefined && (limit = queryData.limit)
        console.log(queryData, page, limit);

        const query = { data: { ...queryData, page, limit }, type: "LOAD" };
        return sendLookup(query);
    };

    const saveRecord = data => {
        console.log(data);
        return sendSave({ data, type: "LOAD" });
    };

    const loadPreview = data => sendPreview({
        type: "LOAD",
        data: { campaignId: data.campaignId }
    });

    const sendSms = campaign => SmsTask
        .sendSms({}, { data: campaign })
        .then(result => {
            notification.success({
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
                message: "Task Failed",
                description: <>
                    Error sending SMS.<br />{JSON.stringify(error)}
                </>,
                duration: 5
            });
        });

    useEffect(() => sendPagedQuery(lookupState.context.payload.data)(), []);

    useEffect(() => {
        Inventory
            .fetchProducts({}, { data: {} })
            .then(data => console.log("fetched inventory", data) || data)
            .then(data => setCampaignPackages(data.products))
            .catch(error => console.log("error fetching inventory", error));
    }, [])

    useEffect(() => {
        saveActor.subscribe(state => {
            const lookupContext = lookupActor.getSnapshot().context;
            const saveContext = saveActor.getSnapshot().context;

            if (state.matches("hasResult")) {
                sendPagedQuery({ ...lookupContext.payload.data, orderBy: "campaignId DESC" })();

                notification.success({
                    message: "Task Complete",
                    description: <>Campaign created: {saveContext.result.campaignId}</>,
                    duration: 5
                });

                editForm.resetFields();
            }

            if (state.matches("hasError")) {
                notification.error({
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

    const onClickView = data => console.log("view", data) || loadPreview(data) || setPreviewing(true);
    const onClickEdit = data => console.log("edit", data);
    const onClickDelete = data => console.log("delete", data);

    const viewContext = lookupState.context;

    const viewPage = viewContext.payload.data.page;
    const viewLimit = viewContext.payload.data.limit;

    return (<Space direction="vertical">
        <Breadcrumb>
            <Breadcrumb.Item>
                {previewing || "Campaign"}
                {previewing && <Button type="link" style={{ padding: 0 }} onClick={() => sendPagedQuery(viewContext.payload.data)() || setPreviewing(false)}>Campaign</Button>}
            </Breadcrumb.Item>
            {previewing && <Breadcrumb.Item>
                {previewState.context.result.campaign.campaignName}
            </Breadcrumb.Item>}
        </Breadcrumb>
        {previewing || <div>
            <Row>
                <Col md={10} style={{ margin: "15px 0" }}>
                    <Card title="Find Campaigns" size="default">
                        <SearchForm onSearch={data => sendPagedQuery(data)(1, viewLimit)} />
                    </Card>
                </Col>
                <Col md={11} push={1} style={{ margin: "15px 0" }}>
                    <Collapse>
                        <Collapse.Panel header="Create Campaign" key="createCampaign">
                            <EditForm form={editForm} record={{}} onSave={saveRecord} />
                        </Collapse.Panel>
                    </Collapse>
                </Col>
            </Row>
            <DataView context={viewContext} onView={onClickView} onEdit={onClickEdit} onDelete={onClickDelete} viewPage={viewPage} viewLimit={viewLimit} />
            <Br />
            <DataPager totalPagingItems={viewContext.result.count} currentPage={viewPage} onPagingChange={sendPagedQuery(viewContext.payload.data)} />
        </div>}
        {previewing && <DataViewSingle context={previewState.context} campaignPackages={campaignPackages} onRunCampaign={campaign => sendSms(campaign)} />}
    </Space>);
};
