import {Select, SelectProps} from "antd";
import {FC, useEffect, useState} from "react";
import {GetMyProjectsRequest} from "../../apis/project";
import {Project} from "../../types/project";
import {getProject} from "../../utils/session";

const {Option} = Select;

export interface ProjectSelectProps extends SelectProps<any> {
    onChange?: (value:any) => void
}

const ProjectSelect:FC<ProjectSelectProps> = (props) => {
    const {onChange, defaultActiveFirstOption} = props;
    const [dataSource, setDataSource] = useState<Project[]>([]);

    useEffect(() => {
        GetMyProjectsRequest().then(data => {
            setDataSource(data);
            if (defaultActiveFirstOption && onChange && getProject() === 0) {
                onChange(data[0]?.id);
            }
        });
    }, [])

    const onProjectChange = (open:any) => {
        if (open) {
            GetMyProjectsRequest().then(data => {
                setDataSource(data);
            });
        }
    }

    return <Select {...props} onDropdownVisibleChange={onProjectChange}>
        {
            dataSource.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)
        }
    </Select>
}

export default ProjectSelect;