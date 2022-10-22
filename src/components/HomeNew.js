import React, {useEffect, useRef, useState} from "react";
import { Button, Card, Col, Collapse, Divider, Image, List, Pagination, Row, Space, Statistic, Table, Tag, Typography, Progress, Badge  } from 'antd';
import Title from "antd/es/typography/Title";
import {Br} from "./Br";
import dayjs from "dayjs";
import {CampaignService} from "../services/CampaignService";
import {
    ArrowDownOutlined,
    ArrowRightOutlined, ArrowUpOutlined,
} from "@ant-design/icons";
import * as sheetjs from "xlsx";
import {Link} from "react-router-dom";
import {ProfileService} from "../services/ProfileService";
import {SmsReportService} from "../services/SmsReportService";
import {AccountingNew} from "../services/AccountingService";
import {InventoryService} from "../services/InventoryService";


const CompleteTaskView = ({ taskReports, viewPage, viewLimit, onView}) => {

    return (<>
        <Table
            size="small"
            dataSource={taskReports}
            rowKey={(taskReport) => taskReport.phoneNumber +'_'+ taskReport.campaignId}
            locale={{ emptyText: taskReports ===null? "E": "NO DATA" }}
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
const PackageView = ({ products, viewPage, viewLimit, onView}) => {
    const getBalanceColor = v => ["green", "yellow", "red", "inherit"][
        [1000, 500, 0, -1].findIndex(r => v > r)
        ];

    return (<>
        <Table
            size="small"
            dataSource={products}
            rowKey={"productId"}
            locale={{ emptyText: products ===null? "E": "NO DATA" }}
            pagination={false}
            style={{ minWidth: "30vw" }}
        >
            <Table.Column
                dataIndex={undefined}
                title={"#"}
                render={(_, __, i) => (viewPage - 1) * viewLimit + (++i)}
            />

            <Table.Column title="Package" dataIndex={"productName"} />
            <Table.Column title="Balance" dataIndex={"stock"} render={v => <Tag color={getBalanceColor(v)}>{v}</Tag>} />
            <Table.Column title="Prefixes" dataIndex={"dialPrefixes"} />
        </Table>
    </>);
};

const PaymentView = ({ payments, viewPage, viewLimit, onView, onEdit, onDelete }) => {

    return (<>
        <Table
            size="small"
            dataSource={payments}
            rowKey={"paymentId"}
            locale={{ emptyText: payments ===null? "E": "NO DATA" }}
            pagination={false}
            style={{ minWidth: "30vw" }}
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

export const HomeNew = () => {
    // Component States
    const [lastProfileQuery, setLastProfileQuery] = useState({});
    const [profile, setProfile] = useState({});
    const [accountBalance, setAccountBalance] = useState(0);
    const [profileFetchError, setProfileFetchError] = useState(null);

    const [lastProductQuery, setLastProductQuery] = useState({});
    const [partyProducts, setPartyProducts] = useState([]);
    const [partyProductsFetchCount, setPartyProductsFetchCount] = useState(0);
    const [partyProductsFetchError, setPartyProductsFetchError] = useState(null);

    const [lastTaskReportQuery, setLastTaskReportQuery] = useState({});
    const [taskReports, setTaskReports] = useState([]);
    const [taskReportsFetchCount, setTaskReportsFetchCount] = useState(0);
    const [taskReportsFetchError, setTaskReportsFetchError] = useState(null);

    const [lastPaymentQuery, setLastPaymentQuery] = useState({});
    const [payments, setPayments] = useState([]);
    const [paymentsFetchCount, setPaymentsFetchCount] = useState(0);
    const [paymentsFetchError, setPaymentsFetchError] = useState(null);


    useEffect(() => {
        AccountingNew.fetchBalanceRequests(lastPaymentQuery)
            .then((data) => {
                console.log(data);
                setPayments(data.payments);
                setPaymentsFetchCount(data.count);
                setPaymentsFetchError(null);
            })
            .catch(error => {
                setPayments([]);
                setPaymentsFetchCount(0);
                setPaymentsFetchError(error);
            });
    }, [lastPaymentQuery]);

    useEffect(() => {
        InventoryService.fetchProducts(lastProductQuery)
            .then((data) => {
                console.log(data);
                setPartyProducts(data.products);
                setPartyProductsFetchCount(data.count);
                setPartyProductsFetchError(null);
            })
            .catch(error => {
                setPartyProducts([]);
                setPartyProductsFetchCount(0);
                setPartyProductsFetchError(error);
            });
    }, [lastProductQuery]);

    useEffect(() => {
        CampaignService.fetchCampaignTaskReports(lastTaskReportQuery)
            .then((data) => {
                console.log(data);
                setTaskReports(data.taskReports);
                setTaskReportsFetchCount(data.count);
                setTaskReportsFetchError(null);
            })
            .catch(error => {
                setTaskReports([]);
                setTaskReportsFetchCount(0);
                setTaskReportsFetchError(error);
            });
    }, [lastTaskReportQuery]);

    const [campaignStatistics, setCampaignStatistics] = useState('');

    useEffect((()=>{
        SmsReportService.getCampaignStatistics()
            .then(data=>{
                setCampaignStatistics(data);
            })
    }),[])

    useEffect(()=>{
        ProfileService.fetchProfile()
            .then(data=>{
                setProfile(data.profile);
                setAccountBalance(data.balance);
            })
    },[])

    useEffect(() => {
        setLastProfileQuery({ page: 1, limit: 10 })
    }, []);
    useEffect(() => {
        setLastProductQuery({ page: 1, limit: 10 })
    }, []);
    useEffect(() => {
        setLastTaskReportQuery({ page: 1, limit: 10 })
    }, []);
    useEffect(() => {
        setLastPaymentQuery({ page: 1, limit: 10 })
    }, []);

    const progressData = [
        {
            key:"1",
            value: 55
        },
        {
            key:"2",
            value: 70
        },
        {
            key:"3",
            value: 85
        },
        {
            key:"4",
            value: 100
        },
        {
            key:"5",
            value: 65
        },
        {
            key:"6",
            value: 100
        }
    ]
    const circleProgressData = [
        {
            key:'1',
            value:75
        },
        {
            key: '2',
            value: 70
        },
        {
            key: '3',
            value: 90
        }

    ]
    const tableData = [
        {
            key:'1',
            name: 'Jhone Dew',
            paymentId: 17001,
            amount: 1540,
            city: 'Dhaka',
            status: 'Pending'
        },
        {
            key:'2',
            name: 'Jhone Dew',
            paymentId: 17002,
            amount: 1540,
            city: 'Khulna',
            status: 'Failed'
        },
        {
            key:'3',
            name: 'Jhone Dew',
            paymentId: 17003,
            amount: 1540,
            city: 'Rajshahi',
            status: 'Sent'
        }
    ]


    return (<>
        <Card>
            <Row gutter={8}>
                <Col md={5}>
                    <Space direction="vertical" size={"small"}>
                        <Space direction="vertical" size={"small"}>
                            <Statistic title="Account Code No." value={profile.partyId} groupSeparator="" />
                            <Statistic title="Account Balance (BDT)" value={accountBalance} precision={2} />
                            <Statistic title="Balance [Package]" value={partyProducts.map(data=>data.stock +'['+data.productId)+']'} precision={2} />
                        </Space>
                    </Space>
                </Col>
                <Divider type="vertical" style={{ height: "inherit", marginRight: "24px" }} />
                <Col md={3}>
                    <Title level={3} style={{color: "#492D3A", marginLeft: 20}}>Today</Title>
                    <Space style={{marginTop: 5}}><ArrowRightOutlined style={{fontSize: 30, color: "#689dc4", marginLeft: 35}} /></Space>
                    <Title level={3} style={{color: "#492D3A", marginTop: 48}}>This Week</Title>
                    <Space style={{marginTop: 5}}><ArrowRightOutlined style={{fontSize: 30, color: "#4F995B", marginLeft: 35}} /></Space>
                </Col>

                <Col md={5}>
                    <Card style={{backgroundImage:'linear-gradient(to right, #2193b0 ,  #6dd5ed)'}}>
                        <Statistic
                            key={1}
                            title={'Campaigns Total'}
                            value={campaignStatistics.campaignCount}
                            valueStyle={{ color: '#ffffff', fontWeight: 900 }}
                        />
                    </Card>
                    <Card style={{backgroundImage:'linear-gradient(to right, #2193b0, #6dd5ed)', marginTop: 10}}>
                        <Statistic
                            key={1}
                            title={'Campaigns Total'}
                            value={campaignStatistics.campaignCount}
                            valueStyle={{ color: '#ffffff', fontWeight: 900 }}
                        />
                    </Card>
                </Col>
                <Col md={5}>
                    <Card style={{backgroundImage:'linear-gradient(to right, #56ab2f, #a8e063)'}}>
                        <Statistic
                            key={2}
                            title={"Success Rate"}
                            value={campaignStatistics.avgSuccessRate}
                            valueStyle={{ color: '#ffffff', fontWeight: 900 }}
                            precision={2}
                            prefix={<ArrowUpOutlined />}
                            suffix="%"
                        />
                    </Card>
                    <Card style={{backgroundImage:'linear-gradient(to right, #56ab2f, #a8e063)', marginTop: 10}}>
                        <Statistic
                            key={2}
                            title={"Success Rate"}
                            value={campaignStatistics.avgSuccessRate}
                            valueStyle={{ color: '#ffffff', fontWeight: 900 }}
                            precision={2}
                            prefix={<ArrowUpOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
                <Col md={5}>
                    <Card style={{backgroundImage:'linear-gradient(to right, #de6262,  #ffb88c)'}}>
                        <Statistic
                            key={3}
                            title={"Failure Rate"}
                            value={campaignStatistics.avgFailureRate}
                            valueStyle={{ color: '#ffffff', fontWeight: 900 }}
                            precision={2}
                            prefix={<ArrowDownOutlined />}
                            suffix="%"
                        />
                    </Card>
                    <Card style={{backgroundImage:'linear-gradient(to right, #de6262,  #ffb88c)', marginTop: 10}}>
                        <Statistic
                            key={3}
                            title={"Failure Rate"}
                            value={campaignStatistics.avgFailureRate}
                            valueStyle={{ color: '#ffffff', fontWeight: 900 }}
                            precision={2}
                            prefix={<ArrowDownOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
            </Row>
        </Card>
        {/*<Space children={<><p /><p /></>} />*/}
        <Card>
            <Row gutter={16}>
                <Col md={8}>
                    <Title level={5}> SMS History </Title>
                    <Space direction="vertical">
                        <Progress type="circle" width={100}  percent={circleProgressData[0].value} />
                        <Badge color="#689dc4" status="processing" text="Pending" style={{paddingLeft: 10}}/>
                    </Space>
                    <Space direction="vertical" style={{padding: 5}}>
                        <Progress type="circle" width={100}  percent={circleProgressData[1].value} strokeColor={"Green"} />
                        <Badge color="#4F995B" status="success" text="Sent" style={{paddingLeft: 10}} />
                    </Space>
                    <Space direction="vertical">
                        <Progress type="circle" width={100}  percent={circleProgressData[2].value} strokeColor={"Red"}/>
                        <Badge color="#FF5733" status="error" text="Failed" style={{paddingLeft: 10}} />
                    </Space>

                </Col>
                <Col md={8}>
                    <Title level={5}> Active Packages </Title>
                    <Progress size="medium" percent={progressData[0].value} />
                    <Progress size="medium" percent={progressData[1].value} status="active" />
                    <Progress size="medium" percent={progressData[2].value} status="exception" />
                    <Progress size="medium" percent={progressData[4].value} />
                    <Progress size="medium" percent={progressData[5].value} showInfo={true} />
                    <Space direction="horizontal">
                        <Badge color="#689dc4" status="processing" text="Pending" />
                        <Badge color="#FF5733" status="error" text="Failed" />
                        <Badge color="#4F995B" status="success" text="Sent" />
                    </Space>
                </Col>
                <Col md={8}>
                    <Table
                        size="small"
                        dataSource={tableData}
                        rowKey={"paymentId"}
                    >
                        <Table.Column title="Payment ID" dataIndex={"paymentId"}/>
                        <Table.Column title="Customers" dataIndex={"name"}/>
                        <Table.Column title="From" dataIndex={"city"}/>
                        <Table.Column title="Amount" dataIndex={"amount"}/>
                        <Table.Column title="Status" dataIndex={"status"} render={v => [
                            <Tag color={"#108ee9"}>Pending</Tag>,
                            <Tag color={"#87d068"}>Sent</Tag>,
                            <Tag color={"#f50"}>Failed</Tag>][[v === "Pending", v === "Sent", v === "Failed"].indexOf(!0)]} />
                    </Table>
                </Col>
            </Row>
        </Card>
        <Space children={<><p /><p /></>} />
        <Space size={"large"} align="baseline">
            <Card title="Recent TopUp / Recharges" size="small">
                <PaymentView payments={payments} viewPage={lastPaymentQuery.page} viewLimit={lastPaymentQuery.limit} />
                <Space children={<><p /><p /></>} />
                <DataPager totalPagingItems={paymentsFetchCount} currentPage={lastPaymentQuery.page}
                           onPagingChange={(page, limit) => setLastProfileQuery({ ...lastPaymentQuery, page, limit })} />
            </Card>
            <Card title={<><Typography.Text>Active Packages</Typography.Text>&nbsp;&nbsp;<Tag color={"blue"}>{partyProductsFetchCount}</Tag></>} size="small">
                <PackageView products={partyProducts} viewPage={lastProductQuery.page} viewLimit={lastProductQuery.limit} />
                <Space children={<><p /><p /></>} />
                <DataPager totalPagingItems={partyProductsFetchCount} currentPage={lastProductQuery.page}
                           onPagingChange={(page, limit) => setLastProfileQuery({ ...lastProductQuery, page, limit })} />
            </Card>
        </Space>
        <Space children={<><p /><p /></>} />
        <Card title="Sent Messages" size="small">
            <CompleteTaskView taskReports={taskReports} viewPage={lastTaskReportQuery.page} viewLimit={lastTaskReportQuery.limit} />
            <Space children={<><p /><p /></>} />
            <DataPager totalPagingItems={taskReportsFetchCount} currentPage={lastTaskReportQuery.page}
                       onPagingChange={(page, limit) => setLastProfileQuery({ ...lastTaskReportQuery, page, limit })} />
        </Card>
    </>);
};
