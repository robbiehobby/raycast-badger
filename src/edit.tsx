import BadgeForm from "./components/form.tsx";

export default function Edit(props: { badge: Badge }) {
  return <BadgeForm badge={props.badge} />;
}
