import { useActor } from "@xstate/react";
import { Button, Col, DatePicker, Form, Input, Pagination, Row, Select, Space, Table, Typography } from "antd";
import { useEffect } from "react";
import dayjs from "dayjs";

const { Text } = Typography;

export const PaymentList = ({ actor: listActor, children }) => {
    const [searchForm] = Form.useForm();

    const [listState, sendList] = useActor(listActor);

    const performSearch = (queryData, page, limit) => {
        queryData["limit"] = limit;
        queryData["page"] = page;
        queryData["orderBy"] = "date DESC";

        ["date_fld0_value", "date_fld1_value"].forEach((n, i) => {
            const date = queryData[n];
            queryData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD") : "";
        });

        const data = ["party.username", "party.name", "date_fld0_value", "date_fld1_value", "statusId"].reduce((acc, v) => {
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
        }, queryData);
        Object.entries(data).length >= 3 && sendList({ type: "LOAD", data });
    };

    const listResult = listState.context.result || { payments: [], count: 0 };
    const listPayload = listState.context.payload;
    const listError = listState.context.error;

    useEffect(() => {
        if (listState.matches("idle")) {
            if (listResult.count > 0 && listResult.payments.length === 0) {
                listState.context.payload.data.page--;
                sendList({ ...listState.context.payload, type: "LOAD" });
            }
        }
    }, [listState]);

    return (<>
        <Space><br /></Space>
        <Row>
            <Col span={16}>
                <Space direction="vertical" size={"large"} style={{ width: "100%" }}>
                    <Text strong>Find Payment Requests</Text>
                    <Form
                        form={searchForm}
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 8 }}
                        labelAlign="left"
                    >
                        <Form.Item name="statusId" label="Payment Status" initialValue={""}>
                            <Select onInputKeyDown={e => (e.code === "Enter") && !console.log("Preventing", e.code) && false}>{
                                [
                                    ["PMNT_CONFIRMED", "Confirmed"],
                                    ["PMNT_NOT_PAID", "Not Paid"],
                                    ["PMNT_CANCELLED", "Canceled"],
                                    ["", "Any"]
                                ].map(([v, vText]) => (
                                    <Select.Option key={v} value={v} children={vText} />
                                ))
                            }</Select>
                        </Form.Item>
                        <Form.Item name="statusId_op" initialValue={"contains"} hidden children={<Input />} />
                        <Form.Item name="date_fld0_value" label="From Date" children={<DatePicker format={"MMM D, YYYY"} />} />
                        <Form.Item name="date_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
                        <Form.Item name="date_fld1_value" label="To Date" children={<DatePicker format={"MMM D, YYYY"} />} />
                        <Form.Item name="date_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input />} />
                        <Form.Item wrapperCol={{ offset: 4 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                onClick={() => performSearch(searchForm.getFieldsValue(), 1, listPayload.data.limit)}
                                children={"Search"}
                            />
                        </Form.Item>
                    </Form>
                </Space>
            </Col>
            <Col span={8}>{children}</Col>
        </Row>
        <Table
            size="small"
            dataSource={listResult.payments}
            rowKey={"paymentId"}
            locale={{ emptyText: listError && `[ ${listError.message} ]` }}
            pagination={false}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (listPayload.data.page - 1) * listPayload.data.limit + (++i)}
            />

            <Table.Column title="Payment ID" dataIndex={"paymentId"} />
            <Table.Column title="Date" dataIndex={"date"} render={value => dayjs(value).format("MMM D, YYYY h:mm A")} />
            <Table.Column title="Amount" dataIndex={"amount"} />
            <Table.Column title="Status" dataIndex={"statusId"} />
        </Table>
        <hr />
        <Space align="end" direction="vertical">
            <Pagination
                total={listResult.count}
                defaultPageSize={10}
                pageSizeOptions={["10", "20", "50", "100", "200"]}
                showSizeChanger={true}
                onChange={(page, limit) => {
                    Object.assign(listPayload.data, { page, limit });
                    sendList({ ...listPayload, type: "LOAD" });
                }}
                current={listPayload.data.page}
            />
        </Space>
    </>);
};
