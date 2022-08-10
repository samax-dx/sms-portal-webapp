import { Button, Card, Col, Collapse, Divider, Image, List, Pagination, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { Dashboard } from "./Dashboard";
import { PaymentInstrument } from "./paymentInstrument";
import { CampaignTasks } from "./campaignTasks";
import { SendSMS } from './SendSMS';
import { useActor } from '@xstate/react';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';


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

    useEffect(() => {
        pageInventoryLoader(1, 5);
        pageSmsReportLoader(1, 5);
        pagePaymentLoader(1, 5);
    }, []);

    return (<>
        <Card title={profileLoaderResult.profile.name}>
            <Row>
                <Col md={3}>
                    <Space direction="vertical" size={"small"}>
                        <Statistic title="Account Code No." value={profileLoaderResult.profile.partyId} groupSeparator="" />
                        <Statistic title="Account Balance (BDT)" value={profileLoaderResult.balance} precision={2} />
                    </Space>
                </Col>
                <Divider type="vertical" style={{ height: "inherit", marginRight: "24px" }} />
                <Col md={20}>
                    <Card title="TopUp / Recharge" size="small">
                        <img src="/payment-methods.png" style={{ maxWidth: "100%" }} />
                    </Card>
                </Col>
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
