import {Collapse} from "antd";

const { Panel } = Collapse;

function callback(key) {
}

const text = `
                        A dog is a type of domesticated animal.
                        Known for its loyalty and faithfulness,
                        it can be found as a welcome guest in many households across the world.
                        `;


export function PaymentInstrument() {
    return <Collapse defaultActiveKey={["1"]} onChange={callback}>
        <Panel header="This is panel header 1 [put dummy payment instruments here]" key="1">
            <p>{text}</p>
        </Panel>

    </Collapse>;
}