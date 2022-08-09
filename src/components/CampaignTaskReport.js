import { useEffect, useState } from "react";
import { Form, Input, Button, Table, Space, Pagination, DatePicker, notification, Collapse, Card, Select, Row, Col,Typography} from "antd";
import dayjs from "dayjs";
import { useActor } from "@xstate/react";
import { Br } from "./Br";


const SearchForm = ({ onSearch }) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {
        const formData = searchForm.getFieldsValue();

        ["updatedOn_fld0_value", "updatedOn_fld1_value"].forEach((n, i) => {
            const date = formData[n];
            formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD") : "";
        });

        const queryData = ["phoneNumber", "campaignName", "packageId", "updatedOn_fld0_value", "updatedOn_fld1_value"].reduce((acc, v) => {
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
            labelCol={{ span: 15 }}
            wrapperCol={{ span: 20}}
            labelAlign="left"
        >
            <Form.Item style={{ display:'inline-block', margin:'0px'}} name="phoneNumber" label="Phone Number" children={<Input />} />
            <Form.Item name="phoneNumber_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item style={{ display:'inline-block', margin:'0px'}} name="campaignName" label="Campaign" children={<Input />} />
            <Form.Item name="campaignName_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item style={{ display:'inline-block', margin:'0px'}} name="packageId" label="Package" children={<Input />} />
            <Form.Item name="packageId_op" initialValue={"contains"} hidden children={<Input />} />
            <Form.Item style={{ display:'inline-block', margin:'0px'}} name="updatedOn_fld0_value" label="From Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="updatedOn_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{ display:'inline-block', margin:'0px'}} name="updatedOn_fld1_value" label="To Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="updatedOn_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{ display:'inline-block', margin:'0px'}} wrapperCol={{ offset: 2 }} colon={false} label=' '>
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

const DataView = ({ context, viewPage, viewLimit, onView, onEdit, onDelete }) => {
    const viewResult = context.result;
    const viewError = context.error;

    return (<>
        <Table
            style={{marginLeft:5}}
            size="small"
            dataSource={viewResult.taskReports}
            rowKey={taskReport => taskReport.phoneNumber + taskReport.campaignId}
            locale={{ emptyText: viewError && `[ ${viewError.message || "Fetch Error"} ]` }}
            pagination={false}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />

            <Table.Column title="PhoneNumber" dataIndex={"phoneNumber"} />
            <Table.Column title="Message" dataIndex={"message"} />
            <Table.Column title="Date" dataIndex={"updatedOn"} render={date => dayjs(date).format("MMM D, YYYY - hh:mm A")} />
            <Table.Column title="Campaign" dataIndex={"campaignName"} />
            <Table.Column title="Package" dataIndex={"packageId"} />
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

export const CampaignTaskReport = ({ actor: [listLoader] }) => {
    // Component States
    const [{ context: listLoaderContext }] = useActor(listLoader);


    // Dependent Helper Functions
    const sendPagedQuery = queryData => (page, limit) => {
        page === undefined && (page = queryData.page)
        limit === undefined && (limit = queryData.limit)
        console.log(queryData, page, limit);

        const query = { data: { ...queryData, page, limit }, type: "LOAD" };
        return listLoader.send(query);
    };


    // Initializers
    useEffect(() => sendPagedQuery(listLoaderContext.payload.data)(), []);


    // Component Current Properties
    const onClickView = data => console.log("view", data);
    const onClickEdit = data => console.log("edit", data);
    const onClickDelete = data => console.log("delete", data);

    const viewPage = listLoaderContext.payload.data.page;
    const viewLimit = listLoaderContext.payload.data.limit;
    const { Title } = Typography;
    return (<>
        <Row style={{marginLeft:5}}>
            <Col md={24}>
                <Card title={<Title level={5}>SMS History</Title>}
                      headStyle={{backgroundColor:"#f0f2f5", border: 0,padding:'0px'}}
                      size='small'>
                    <SearchForm onSearch={data => sendPagedQuery(data)(1, viewLimit)} />
                </Card>
            </Col>
        </Row>
        {/*<Br />*/}
        <DataView context={listLoaderContext} onView={onClickView} onEdit={onClickEdit} onDelete={onClickDelete} viewPage={viewPage} viewLimit={viewLimit} />
        <Br />
        <DataPager totalPagingItems={listLoaderContext.result.count} currentPage={viewPage} onPagingChange={sendPagedQuery(listLoaderContext.payload.data)} />
    </>);
};
