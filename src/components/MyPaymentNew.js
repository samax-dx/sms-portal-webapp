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
    Modal, Typography, DatePicker, notification
} from "antd";
import Title from "antd/es/typography/Title";
import {Br} from "./Br";
import {AccountingNew} from "../services/AccountingService";
import dayjs from "dayjs";


const SearchForm = ({ onSearch }) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {
        const formData = searchForm.getFieldsValue();

        ["date_fld0_value", "date_fld1_value"].forEach((n, i) => {
            const date = formData[n];
            formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD") : "";
        });

        const queryData = ["date_fld0_value", "date_fld1_value"].reduce((acc, v) => {
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
        onSearch(Object.keys(queryData).length ? queryData : null);
    };

    return (<>
        <Form
            form={searchForm}
            labelCol={{ span: 15}}
            wrapperCol={{ span: 23}}
            labelAlign="left"
        >
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="date_fld0_value" label="From Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="date_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="date_fld1_value" label="To Date" children={<DatePicker format={"MMM D, YYYY"} />} />
            <Form.Item name="date_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input />} />
            <Form.Item style={{display:'inline-block', margin:'0px'}} wrapperCol={{ offset: 5 }} colon={false} label=' '>
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

const DataView = ({ payments, viewPage, viewLimit}) => {

    return (<>
        <Table
            style={{marginLeft:'6px'}}
            size="small"
            dataSource={payments}
            rowKey={"paymentId"}
            locale={{ emptyText: payments ===null? "E": "NO DATA" }}
            pagination={false}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />

            <Table.Column title="Payment ID" dataIndex={"paymentId"} />
            <Table.Column title="Amount" dataIndex={"amount"} render={v => v.toFixed(2)} />
            <Table.Column title="Date" dataIndex={"date"} render={date => dayjs(date).format("MMM D, YYYY - hh:mm A")} />
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

export const MyPaymentNew = () => {
    // Component States
    const [lastQuery, setLastQuery] = useState({});
    const [payments, setPayments] = useState([]);
    const [PaymentsFetchCount, setPaymentsFetchCount] = useState(0);
    const [paymentsFetchError, setPaymentsFetchError] = useState(null);


    useEffect(() => {
        AccountingNew.fetchBalanceRequests(lastQuery)
            .then((data) => {
                console.log(data)
                setPayments(data.payments);
                setPaymentsFetchCount(data.count);
                setPaymentsFetchError(null);
            })
            .catch(error => {
                setPayments([]);
                setPaymentsFetchCount(0);
                setPaymentsFetchError(error);
            });
    }, [lastQuery]);

    useEffect(() => {
        setLastQuery({ page: 1, limit: 10 })
    }, []);


    return (<>
        <Row>
            <Col md={24} style={{marginLeft:'5px'}}>
                <Card title={<Title level={5}>Payment History</Title>}
                      headStyle={{backgroundColor:"#f0f2f5", border: 0,padding:'0px'}} size='small'>
                    <SearchForm onSearch={data => setLastQuery({ ...(data || {}), page: 1, limit: lastQuery.limit })}/>
                </Card>
            </Col>
        </Row>
        <DataView payments={payments} viewPage={lastQuery.page} viewLimit={lastQuery.limit}/>
        <Br />
        <DataPager totalPagingItems={PaymentsFetchCount} currentPage={lastQuery.page}
                              onPagingChange={(page, limit) => setLastQuery({ ...lastQuery, page, limit })} />
    </>);
};
