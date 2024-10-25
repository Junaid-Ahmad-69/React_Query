import {Link, useNavigate, useParams} from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import {useMutation, useQuery} from "@tanstack/react-query";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import {fetchEvent, queryClient, updateEvent} from "../../utils/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";

export default function EditEvent() {
    const navigate = useNavigate();
    const params = useParams()

    const {data, isPending, isError, error} =  useQuery({
        queryKey: ['events', params.id],
        queryFn:({signal})=>  fetchEvent({signal, id: params.id})
    })

    const {mutate} =  useMutation({
    mutationFn: updateEvent,
        onMutate: async (data)=> {
        const newEvent = new data.event
            await queryClient.cancelQueries({queryKey: ['events', params.id]})
         queryClient.setQueriesData(['events', params.id], newEvent )
        }
  })

  function handleSubmit(formData) {
   mutate({id: params.id, event: formData})
      navigate('../')
  }

  function handleClose() {
    navigate('../');
  }


  let content;
    if(isPending){
        content= <div className="center">
            <LoadingIndicator/>
        </div>
    }
    if(isError){
        content= <>
        <ErrorBlock title="Failed to load event" message={error.info?.message || 'Failed to load event. Please check your inputs and try again later. '}/>
            <div>
                <Link to="../" className="button">
                    Okay
                </Link>
            </div>
        </>
    }

    if(data){
        content= <><EventForm inputData={data}  onSubmit={handleSubmit}>
            {isPending && "submitting...."}
            {!isPending &&
                <>
                    <Link to="../" className="button-text">
                        Cancel
                    </Link>
                    <button type="submit" className="button">
                        Update
                    </button>
                </>
            }
        </EventForm>
        {isError && <ErrorBlock title={"Failed to create event"} message={error.info?.message || 'Please check your inputs and try again later.'}/> }
            </>

    }

  return (
    <Modal onClose={handleClose}>
        {content}
    </Modal>
  );
}
