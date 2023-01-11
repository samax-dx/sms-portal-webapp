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
import dayjs from "dayjs";
import moment from "moment";
import {RatePlanService} from "../services/RatePlanService";
import {PartyIdCatcher} from "./HomeNew";



const SearchForm = ({ onSearch }) => {
    const [searchForm] = Form.useForm();

    const performSearch = () => {
        const formData = searchForm.getFieldsValue();

        ["orderDate_fld0_value", "orderDate_fld1_value"].forEach((n, i) => {
            const date = formData[n];
            formData[n] = date ? dayjs(date).add(i, "day").format("YYYY-MM-DD HH:mm:ss") : null;

            if (formData[n] === null) {
                delete formData[n];
            }
        });

        const queryData = ["ratePlanName", "orderDate_fld0_value", "orderDate_fld1_value"].reduce((acc, v) => {
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
            initialValues={{ date_fld0_value: moment().subtract(1, 'days'), date_fld1_value:moment(new Date()) }}
        >
            <Form.Item style={{display:'inline-block', margin:'0px'}} name="ratePlanName" label="Rate-Plan Name" children={<Input />} />
            <Form.Item name="ratePlanName_op" initialValue={"contains"} hidden children={<Input />} />
            {/*<Form.Item style={{display:'inline-block', margin:'0px'}} name="date_fld0_value" label="From Date" children={<DatePicker showTime use12Hours={true} format="YYYY-MM-DD HH:mm:ss" />} />*/}
            {/*<Form.Item name="date_fld0_op" initialValue={"greaterThanEqualTo"} hidden children={<Input />} />*/}
            {/*<Form.Item style={{display:'inline-block', margin:'0px'}} name="date_fld1_value" label="To Date" children={<DatePicker showTime use12Hours={true} format="YYYY-MM-DD HH:mm:ss" />} />*/}
            {/*<Form.Item name="date_fld1_op" initialValue={"lessThanEqualTo"} hidden children={<Input />} />*/}
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

const DataView = ({ ratePlans, viewPage, viewLimit}) => {

    return (<>
        <Table
            style={{ marginLeft: 6 }}
            size="small"
            dataSource={ratePlans}
            rowKey={"ratePlanId"}
            locale={{ emptyText: ratePlans === null ? "E" : "No Data" }}
            pagination={false}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />
            <Table.Column title="RatePlan Id" dataIndex={"ratePlanId"}/>
            <Table.Column title="Rate-Plan Name" dataIndex={"ratePlanName"} />
            <Table.Column title="Currency" dataIndex={"currencyCode"} />
            <Table.Column title="Description" dataIndex={"description"} />
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

export const MyRatePlan = () => {
    // Component States
    const [lastQuery, setLastQuery] = useState({});
    const [ratePlans, setRatePlans] = useState([]);
    const [ratePlansFetchCount, setRatePlansFetchCount] = useState(0);
    const [ratePlansFetchError, setRatePlansFetchError] = useState(null);


    useEffect(() => {
        RatePlanService.fetchRatePlan(lastQuery)
            .then((data) => {
                console.log(data)
                setRatePlans(data);
                setRatePlansFetchCount(data.count);
                setRatePlansFetchError(null);
            })
            .catch(error => {
                setRatePlans([]);
                setRatePlansFetchCount(0);
                setRatePlansFetchError(error);
            });
    }, [lastQuery]);

    useEffect(() => {
        setLastQuery({ page: 1, limit: 10 })
    }, []);


    return (<>
        <Row>
            <Col md={24} style={{marginLeft:'5px'}}>
                <Card title={<Title level={5}>Rate-Plan</Title>}
                      headStyle={{backgroundColor:"#f0f2f5", border: 0,padding:'0px'}}>
                    <SearchForm onSearch={data => setLastQuery({ ...(data || {}), page: 1, limit: lastQuery.limit, orderBy: lastQuery.orderBy })}/>
                </Card>
            </Col>
        </Row>
        <DataView ratePlans={ratePlans} viewPage={lastQuery.page} viewLimit={lastQuery.limit}/>
        <Br />
        <DataPager totalPagingItems={ratePlansFetchCount} currentPage={lastQuery.page}
                              onPagingChange={(page, limit) => setLastQuery({ ...lastQuery, page, limit })} />
    </>);
};
