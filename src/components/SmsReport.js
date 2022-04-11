import { Card, Col, Row, Space } from "antd";
import { SmsTask } from "../services/SmsTask";

export const SmsReport = ({ actor }) => {
    return (<>
        <Space><br /></Space>
        <div key="taskReports">{SmsTask.lastTaskReports().map((report, i) => (
            <Card size="small" key={i}>
                <Row gutter={[8, 8]}>
                    <Col span={6}>Contact Number</Col>
                    <Col span={18}>{report.MobileNumber}</Col>
                </Row>
                <Row gutter={[8, 8]}>
                    <Col span={6}>Send Status</Col>
                    <Col span={18}>{(report.MessageErrorCode > 0 ? "Error: " : "") + report.MessageErrorDescription}</Col>
                </Row>
            </Card>
        ))}</div>
        <div key="taskErrors">{SmsTask.lastTaskErrors().map((error, i) => (
            <Card size="small" key={i}>
                {error.message}
            </Card>
        ))}</div>
    </>);
};
