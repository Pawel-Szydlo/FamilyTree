alter table public.notification_logs
  add column if not exists delivery_status text not null default 'sent'
  check (delivery_status in ('pending', 'sent', 'failed'));

update public.notification_logs
set delivery_status = case
  when error_message is not null then 'failed'
  else 'sent'
end
where delivery_status = 'sent';

create index if not exists notification_logs_delivery_idx
  on public.notification_logs (recipient_user_id, person_id, notification_type, birthday_year, delivery_status);
