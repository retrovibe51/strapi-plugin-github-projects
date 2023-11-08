import React, { useEffect, useState } from 'react';
import { Table, Thead, Tbody, Tr, Td, Th } from '@strapi/design-system';    // '@strapi/design-system/Table'
import { Box, Typography, BaseCheckbox, Loader, Alert, Link, Flex, IconButton } from "@strapi/design-system";
import { Pencil, Trash, Plus } from '@strapi/icons';
// import axios from "axios";
import axios from '../utils/axiosInstance';
import { auth } from "@strapi/helper-plugin";
import ConfirmationDialog from './ConfirmationDialog';
import BulkActions from './BulkActions';
import { useIntl } from "react-intl";
import getTrad from '../utils/getTrad';

const COL_COUNT = 5;
const ROW_COUNT = 6;

const Repo = () => {

    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRepos, setSelectedRepos] = useState([]); // ids
    const [alert, setAlert] = useState(undefined);
    const [deletingRepo, setDeletingRepo] = useState(undefined);    // repo being deleted
    const { formatMessage } = useIntl();

    const showAlert = (alert) => {
        setAlert(alert);
        setTimeout(() => {
            setAlert(undefined);
        }, 5000);
    }

    const createProject = (repo) => {
        // axios.post("http://192.168.1.106:1337/github-projects/project", repo, { headers: { 'Authorization': `Bearer ${auth.get('jwtToken')}` } })
        axios.post("github-projects/project", repo)
            .then((response) => {
                setRepos(
                    repos.map((item) => item.id !== repo.id ? item : { ...item, projectId: response.data.id })
                );
                showAlert({
                    title: "Project created",
                    message: `Succesfully created project ${response.data.title}`,
                    variant: "success"
                });
            })
            .catch((error) => {
                showAlert({
                    title: "An error occured",
                    message: "Error creating the project. Please retry!",
                    variant: "danger"
                });
            });
    }

    const deleteProject = (repo) => {
        const { projectId } = repo;
        // axios.delete(`http://192.168.1.106:1337/github-projects/project/${projectId}`, { headers: { 'Authorization': `Bearer ${auth.get('jwtToken')}` } })
        axios.delete(`github-projects/project/${projectId}`)
            .then((response) => {
                setRepos(
                    repos.map((item) => item.id !== repo.id ? item : { ...item, projectId: null })
                );
                showAlert({
                    title: "Project deleted",
                    message: `Succesfully deleted project ${response.data.title}`,
                    variant: "success"
                });
            })
            .catch((error) => {
                showAlert({
                    title: "An error occured",
                    message: "Error deleting the project. Please retry!",
                    variant: "danger"
                })
            });
    }

    const createAll = (reposToBecomeProjects) => {
        // axios.post("http://192.168.1.106:1337/github-projects/projects", {
        //     repos: reposToBecomeProjects
        // }, { headers: { 'Authorization': `Bearer ${auth.get('jwtToken')}` } })
        axios.post("github-projects/projects", {
            repos: reposToBecomeProjects
        })
            .then((response) => {
                setRepos(repos.map((repo) => {
                    const relatedProjectJustCreated = response.data.find((project) => project.repositoryId == repo.id);
                    console.log("typeof response.data[0].repositoryId", typeof response.data[0].repositoryId,"typeof repo.id",typeof repo.id); // remove
                    return (!repo.projectId && relatedProjectJustCreated) ? { ...repo, projectId: relatedProjectJustCreated.id } : repo;
                }));
                showAlert({
                    title: "Project created",
                    message: `Succesfully created ${response.data.length} projects`,
                    variant: "success"
                });
            })
            .catch((error) => {
                showAlert({
                    title: "An error occured",
                    message: error.toString(),  // old message: "At least one project wasn't correctly created. Please check and retry!",
                    variant: "danger"
                });
            })
            .finally(() => {
                setSelectedRepos([]);
            });
    }

    const deleteAll = (projectIds) => {
        // axios.delete("http://192.168.1.106:1337/github-projects/projects", {
        //     params: { projectIds },
        //     headers: { 'Authorization': `Bearer ${auth.get('jwtToken')}` }
        // })
        axios.delete("github-projects/projects", { params: { projectIds } })
            .then((response) => {
                setRepos(repos.map((repo) => {
                    const relatedProjectJustDeleted = response.data.find((project) => project.repositoryId == repo.id);
                    return (repo.projectId && relatedProjectJustDeleted) ? { ...repo, projectId: null } : repo;
                }));
                showAlert({
                    title: "Projects deleted",
                    message: `Succesfully deleted ${response.data.length} projects`,
                    variant: "success"
                });
            })
            .catch((error) => {
                showAlert({
                    title: "An error occured",
                    message: "At least one project wasn't correctly deleted. Please check and retry!",
                    variant: "danger"
                });
            })
            .finally(() => {
                setSelectedRepos([]);
            });
    }

    useEffect(() => {
        setLoading(true);
        // fetch data
        // axios.get("http://192.168.1.106:1337/github-projects/repos", { headers: { 'Authorization': `Bearer ${auth.get('jwtToken')}` } })
        axios.get("github-projects/repos")
            .then((response) => setRepos(response.data))
            .catch((error) => showAlert({
                title: "Error fetching repositories",
                message: error.toString(),
                variant: "danger"
            }));
        setLoading(false);
    }, []);


    if(loading) {
        return <Loader />
    }

    console.log("repos",repos,process.env.STRAPI_ADMIN_BACKEND_URL);

    const allChecked = (selectedRepos.length == repos.length);
    const isIndeterminate = selectedRepos.length > 0 && !allChecked; // some repos selected, but not all

    return(
        <Box padding={8} background="neutral100">
            {alert && (
                <div style={{position: "absolute", top: 0, left: "14%", zIndex: 10}}>
                    <Alert closeLabel='Close alert' title={alert.title} variant={alert.variant}>{alert.message}</Alert>
                </div>
            )}
            {selectedRepos.length > 0 && (
                <BulkActions
                    selectedRepos={selectedRepos.map((repoId) => repos.find((repo) => repo.id === repoId))}
                    bulkCreateAction={createAll}
                    bulkDeleteAction={deleteAll}
                />
            )}
            <Table colCount={COL_COUNT} rowCount={repos.length}>
                <Thead>
                    <Tr>
                        <Th>
                            <BaseCheckbox aria-label="Select all entries" 
                                value={allChecked} indeterminate={isIndeterminate}
                                onValueChange={(value) => value ? setSelectedRepos(repos.map((repo) => repo.id)) : setSelectedRepos([])}
                            />
                        </Th>
                        <Th>
                            <Typography variant="sigma">{formatMessage({ id: getTrad("repo.name"), defaultMessage: "Name" })}</Typography>
                        </Th>
                        <Th>
                            <Typography variant="sigma">Description</Typography>
                        </Th>
                        <Th>
                            <Typography variant="sigma">Url</Typography>
                        </Th>
                        <Th>
                            <Typography variant="sigma">Actions</Typography>
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {repos.map((repo) => {
                        const { id, name, shortDescription, url, projectId } = repo;
                        return (
                        <Tr key={id}>
                            <Td>
                                <BaseCheckbox 
                                    aria-label={`Select ${id}`} value={selectedRepos.includes(id)}
                                    onValueChange={(value) => {
                                        const newSelectedRepos = value ? [...selectedRepos, id] : selectedRepos.filter((item) => item !== id);
                                        setSelectedRepos(newSelectedRepos);
                                    }}
                                />
                            </Td>
                            <Td>
                                <Typography textColor="neutral800">{name}</Typography>
                            </Td>
                            <Td>
                                <Typography stextColor="neutral800">{shortDescription}</Typography>
                            </Td>
                            <Td>
                                <Typography textColor="neutral800">
                                    <Link href={url} isExternal>{url}</Link>
                                </Typography>
                            </Td>
                            <Td>
                                { projectId ?
                                    (<Flex>
                                        <Link to={`/content-manager/collectionType/plugin::github-projects.project/${projectId}`}>
                                            <IconButton onClick={() => console.log('edit')} label="Edit" noBorder icon={<Pencil />} />
                                        </Link>
                                        <Box paddingLeft={1}>
                                            <IconButton onClick={() => setDeletingRepo(repo)} label="Delete" noBorder icon={<Trash />} />
                                        </Box>
                                    </Flex>) :
                                    (
                                        <IconButton
                                            onClick={() => createProject(repo)}
                                            label="Add" noBorder icon={<Plus />}
                                        />
                                    )
                                }
                            </Td>
                        </Tr>);
                        
                    })}
                </Tbody>
            </Table>
            {deletingRepo && (
                <ConfirmationDialog
                    visible={!!deletingRepo}
                    message="Are you sure you want to delete this project?"
                    onClose={() => setDeletingRepo(undefined)}
                    onConfirm={() => deleteProject(deletingRepo)}
                />
            )}
        </Box>
    );
}

export default Repo;