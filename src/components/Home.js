import { Button, Card, Col, Collapse, Divider, Image, List, Pagination, Row, Space, Statistic, Table, Tag, Typography, Progress  } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, FallOutlined } from '@ant-design/icons'
import { Dashboard } from "./Dashboard";
import { PaymentInstrument } from "./paymentInstrument";
import { CampaignTasks } from "./campaignTasks";
import { SendSMS } from './SendSMS';
import { useActor } from '@xstate/react';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Title from 'antd/lib/skeleton/Title';


const CompleteTaskView = ({ context, viewPage, viewLimit, onView, onEdit, onDelete }) => {
    const viewResult = context.result;
    const viewError = context.error;

    return (<>
        <Table
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

const PackageView = ({ context, viewPage, viewLimit, onView, onEdit, onDelete }) => {
    const viewResult = context.result;
    const viewError = context.error;

    const getBalanceColor = v => ["green", "yellow", "red", "inherit"][
        [1000, 500, 0, -1].findIndex(r => v > r)
    ];

    return (<>
        <Table
            size="small"
            dataSource={viewResult.products}
            rowKey={"productId"}
            locale={{ emptyText: viewError && `[ ${viewError.message || "Fetch Error"} ]` }}
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
            <Table.Column title="Prefixes" dataIndex={"packagePrefixes"} />
        </Table>
    </>);
};

const PaymentView = ({ context, viewPage, viewLimit, onView, onEdit, onDelete }) => {
    const viewResult = context.result;
    const viewError = context.error;

    return (<>
        <Table
            size="small"
            dataSource={viewResult.payments}
            rowKey={"paymentId"}
            locale={{ emptyText: viewError && `[ ${viewError.message || "Fetch Error"} ]` }}
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

const ViewPager = ({ totalPagingItems, currentPage, onPagingChange, pageSize }) => {
    return (<>
        <Space align="end" direction="vertical" style={{ width: "100%" }}>
            <Pagination
                total={totalPagingItems}
                defaultPageSize={pageSize || 10}
                pageSizeOptions={["5", "10", "20", "50", "100", "200"]}
                showSizeChanger={true}
                onChange={onPagingChange}
                current={currentPage}
            />
        </Space>
    </>);
};

const QueryPager = (sender, data) => (page, limit) => {
    page === undefined && (page = data.page);
    limit === undefined && (limit = data.limit);
    console.log(data, page, limit);

    const query = { data: { ...data, page, limit }, type: "LOAD" };
    return sender(query);
};

const useLoader = loader => {
    const [loaderState, sendLoader] = useActor(loader);
    return [loaderState, sendLoader, QueryPager(sendLoader, loaderState.context.payload.data)];
};

export const Home = ({ actor: [profileLoader, inventoryLoader, smsReportLoader, paymentLoader] }) => {
    const [profileLoaderState, sendProfileLoader, pageProfileLoader] = useLoader(profileLoader);
    const { result: profileLoaderResult, error: profileLoaderError } = profileLoaderState.context;
    const { page: profileLoaderPage, limit: profileLoaderLimit } = profileLoaderState.context.payload.data;

    const [inventoryLoaderState, sendInventoryLoader, pageInventoryLoader] = useLoader(inventoryLoader);
    const { result: inventoryLoaderResult, error: inventoryLoaderError } = inventoryLoaderState.context;
    const { page: inventoryLoaderPage, limit: inventoryLoaderLimit } = inventoryLoaderState.context.payload.data;

    const [smsReportLoaderState, sendSmsReportLoader, pageSmsReportLoader] = useLoader(smsReportLoader);
    const { result: smsReportLoaderResult, error: smsReportLoaderError } = smsReportLoaderState.context;
    const { page: smsReportLoaderPage, limit: smsReportLoaderLimit } = smsReportLoaderState.context.payload.data;

    const [paymentLoaderState, sendPaymentLoader, pagePaymentLoader] = useLoader(paymentLoader);
    const { result: paymentLoaderResult, error: paymentLoaderError } = paymentLoaderState.context;
    const { page: paymentLoaderPage, limit: paymentLoaderLimit } = paymentLoaderState.context.payload.data;
    const { Title, Text } = Typography;
    const dashData = [
        {
            key: '1',    
            title: "Active",
            value: 78
        },
        {
            key: '2',    
            title: "Idle",
            value: 27
        },
        {
            key: '3',    
            title: "Active",
            value: 75
        }
    ]
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
            value: 100
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

    useEffect(() => {
        pageInventoryLoader(1, 5);
        pageSmsReportLoader(1, 5);
        pagePaymentLoader(1, 5);
    }, []);

    return (<>
        <Card title={profileLoaderResult.profile.name}>
            <Row>
            <Col md={24}>
                <Space direction="horizontal" size={"small"}>
                    <Title level={4} style={{display:'block', marginTop: 5}}>Account Code No.</Title>
                    <Statistic style={{marginRight: 50, marginBottom: 5, display:'block'}} title="" value={profileLoaderResult.profile.partyId} groupSeparator="" />
                    <Title level={4} style={{display:'block', marginTop: 5}}>Account Balance (BDT)</Title>
                    <Statistic title="" style={{marginRight: 50, marginBottom: 5}} value={profileLoaderResult.balance} precision={2} />
                    <Title level={4} style={{marginLeft: 40}}>Recent TopUp / Recharges</Title>
                </Space>
            </Col>
            </Row>
            <Row gutter={12} style={{marginBottom: 5}} className="site-statistic-demo-card">
                {/* <Divider type="vertical" style={{ height: "inherit", marginRight: "24px" }} /> */}
                <Col span={4}>
                    <Card style={{backgroundColor:'#4F995B'}}>
                        <Statistic
                            title={dashData[0].title}
                            value={dashData[0].value}
                            precision={2}
                            valueStyle={{ color: '#ffffff', fontWeight: 900 }}
                            prefix={<ArrowUpOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card style={{backgroundColor:'#689dc4'}}>
                        <Statistic
                            key={2}
                            title={dashData[1].title}
                            value={dashData[1].value}
                            precision={2}
                            valueStyle={{ color: '#ffffff', fontWeight: 900 }}
                            prefix={<ArrowDownOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card style={{backgroundColor:'#FF5733'}}>
                        <Statistic
                            title={dashData[2].title}
                            value={dashData[2].value}
                            precision={2}
                            valueStyle={{ color: '#ffffff', fontWeight: 900 }}
                            titleStyle={{color: 'white'}}
                            prefix={<ArrowUpOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
                <Col style={{marginLeft: 140}}>
                    <Progress type="circle" percent={circleProgressData[0].value} />
                    <Progress type="circle" percent={circleProgressData[1].value} status="exception" />
                    <Progress type="circle" percent={circleProgressData[2].value} />
                </Col>
                <Col>
                    <Table 
                        size="small"
                        style={{marginTop: 30, marginRight: 70}}
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
                <Col style={{width: 500, marginTop: 30, marginLeft: 40}}>
                    <Title level={5}> Active Packages </Title>
                    <Progress percent={progressData[0].value} />
                    <Progress percent={progressData[1].value} status="active" />
                    <Progress percent={progressData[2].value} status="exception" />
                    <Progress percent={progressData[4].value} />
                    <Progress percent={progressData[5].value} showInfo={true} />
                </Col>

                {/* <Row md={3} style={{marginTop:15}}>
                <Card title="TopUp / Recharge" size="small">
                    <img src="/payment-methods.png" style={{ maxWidth: '100%'}} />
                </Card>
                </Row> */}
            </Row>
        </Card>
        <Space children={<><p /><p /></>} />
        <Space size={"large"} align="baseline">
            <Card title="Recent TopUp / Recharges" size="small">
                <PaymentView context={paymentLoaderState.context} viewPage={paymentLoaderPage} viewLimit={paymentLoaderLimit} />
                <Space children={<><p /><p /></>} />
                <ViewPager totalPagingItems={paymentLoaderResult.count} currentPage={paymentLoaderPage} onPagingChange={pagePaymentLoader} pageSize={5} />
            </Card>
            <Card title={<><Typography.Text>Active Packages</Typography.Text>&nbsp;&nbsp;<Tag color={"blue"}>{inventoryLoaderResult.count}</Tag></>} size="small">
                <PackageView context={inventoryLoaderState.context} viewPage={inventoryLoaderPage} viewLimit={inventoryLoaderLimit} />
                <Space children={<><p /><p /></>} />
                <ViewPager totalPagingItems={inventoryLoaderResult.count} currentPage={inventoryLoaderPage} onPagingChange={pageInventoryLoader} pageSize={5} />
            </Card>
        </Space>
        <Space children={<><p /><p /></>} />
        <Card title="Sent Messages" size="small">
            <CompleteTaskView context={smsReportLoaderState.context} viewPage={smsReportLoaderPage} viewLimit={smsReportLoaderLimit} />
            <Space children={<><p /><p /></>} />
            <ViewPager totalPagingItems={smsReportLoaderResult.count} currentPage={smsReportLoaderPage} onPagingChange={pageSmsReportLoader} pageSize={5} />
        </Card>
    </>);
};
