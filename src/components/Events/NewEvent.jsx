import { Link, useNavigate } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import {useMutation} from "@tanstack/react-query";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import {createNewEvent, queryClient} from "../../utils/http.js";

export default function NewEvent() {
  const navigate = useNavigate();
  const {mutate, isPending, isError, error} =  useMutation({
    mutationFn: createNewEvent,
    onSuccess: ()=> {
      queryClient.invalidateQueries({
        queryKey: ['events'],
      })
      navigate("/events")
    }
  })
  function handleSubmit(formData) {
    mutate({event: formData})
  }


  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
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

    </Modal>
  );
}
