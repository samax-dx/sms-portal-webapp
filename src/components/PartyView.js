import { useActor } from "@xstate/react";
import { Button, Modal, Table } from "antd";

export const PartyView = ({ actor }) => {
    const [vmState, send] = useActor(actor);
    const [parentState, sendParent] = useActor(actor.parent);

    const { party } = vmState.context;
    const onClose = () => sendParent({ type: "VIEW_LIST" });

    return (
        <Modal
            title={`Party : ${party.partyId}`}
            visible={true}
            onCancel={onClose}
            footer={[
                <Button type="primary" key="btnSave" onClick={() => sendParent({ type: "EDIT_ITEM", data: party })}>Edit</Button>,
                <Button type="primary" danger key="btnClose" onClick={onClose}>Close</Button>
            ]}
        >
            <Table
                size="small"
                dataSource={Object.entries(party)}
                rowKey={0}
                pagination={false}
            >
                <Table.Column title={"Field"} dataIndex={0}></Table.Column>
                <Table.Column title={"Value"} dataIndex={1}></Table.Column>
            </Table>
        </Modal>
    );
};
