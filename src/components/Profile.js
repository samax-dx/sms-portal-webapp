import { useActor } from "@xstate/react";
import { Card, Col, Row, Typography } from "antd";
import { useEffect } from "react";

export const Profile = ({ actor }) => {
    const [queryState, sendQuery] = useActor(actor);

    useEffect(() => {
        sendQuery({ type: "LOAD" });
    }, []);

    const queryResult = queryState.context.result || { profile: {}, balance: "" };
    const queryPayload = queryState.context.payload;
    const queryError = queryState.context.error;

    return (({ profile, balance }) => <div style={{ minWidth: "180px" }}>
        <Row>
            <Col><Typography.Text strong>{profile.loginId}</Typography.Text></Col>
            <Col>&nbsp;</Col>
        </Row>
        <Row>
            <Col span={8}>Balance: </Col>
            <Col>{balance} BDT</Col>
        </Row>
    </div>)(queryResult);
};
