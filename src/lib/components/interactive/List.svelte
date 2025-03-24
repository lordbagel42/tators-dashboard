<script lang="ts">
  import { onMount } from "svelte";
  import interact from "interactjs";

  interface Props {
    items: string[];
    listType: string;
    onUpdate: (items: string[]) => void;
  }

  const { items, onUpdate }: Props = $props();
  let listContainer: HTMLUListElement;

  let draggingIndex: number | null = null;
  let placeholder: HTMLElement | null = null;

  function setupDragAndDrop() {
    interact(".list-item").draggable({
      autoScroll: true,
      listeners: {
        start(event) {
          const target = event.target;
          target.classList.add("dragging");
          draggingIndex = parseInt(target.dataset.index);

          // Get the initial position relative to the viewport
          const rect = target.getBoundingClientRect();
          target.dataset.startX = rect.left; // Offset from the left
          target.dataset.startY = event.clientY + rect.height;  // Offset from the top

          // Create a placeholder for live reordering
          placeholder = document.createElement("li");
          placeholder.className = "placeholder";
          placeholder.style.height = `${target.offsetHeight}px`;
          target.parentNode.insertBefore(placeholder, target);

          // Move the dragged element out of flow
          target.style.position = "absolute";
          target.style.zIndex = "1000";
          target.style.transform = `translate(${event.clientX - parseFloat(target.dataset.startX)}px, ${event.clientY - parseFloat(target.dataset.startY)}px)`;
        },
        move(event) {
          const target = event.target;

          // Move the item visually, using the initial offsets
          requestAnimationFrame(() => {
            target.style.transform = `translate(${event.clientX - parseFloat(target.dataset.startX)}px, ${event.clientY - parseFloat(target.dataset.startY)}px)`;
            // Find the closest element to swap with
            const listItems = [...listContainer.children].filter((child) => child !== target && child !== placeholder);
            const closest = listItems.find((item) => {
              const rect = item.getBoundingClientRect();
              return event.clientY > rect.top && event.clientY < rect.bottom;
            });

            if (closest && closest !== placeholder && placeholder) {
              listContainer.insertBefore(placeholder, closest);
            }
          });
        },
        end(event) {
          const target = event.target;
          target.classList.remove("dragging");
          target.style.transform = "";
          target.style.position = "";
          target.style.zIndex = "";
          target.dataset.startX = "";
          target.dataset.startY = "";

          // Finalize item order
          if (placeholder) {
            const newIndex = [...listContainer.children].indexOf(placeholder);
            if (draggingIndex !== null && newIndex !== draggingIndex) {
              const updatedItems = [...items];
              const [movedItem] = updatedItems.splice(draggingIndex, 1);
              updatedItems.splice(newIndex, 0, movedItem);
              onUpdate(updatedItems);
            }
            placeholder.remove();
            placeholder = null;
          }

          draggingIndex = null;
        }
      }
    });
  }

  onMount(() => {
    setupDragAndDrop();
  });
</script>

<ul bind:this={listContainer} class="interactive-list">
  {#each items as item, index}
    <li class="list-item" data-index={index} draggable="true">{item}</li>
  {/each}
</ul>

<style>
  .interactive-list {
    width: 200px;
    min-height: 150px;
    border: 2px dashed #ddd;
    padding: 10px;
    list-style: none;
    position: relative;
  }

  .list-item {
    padding: 8px;
    margin: 4px 0;
    border: 1px solid #ccc;
    cursor: grab;
    user-select: none;
  }

  .dragging {
    opacity: 0.8;
    cursor: grabbing;
  }

  .placeholder {
    background: #f0f0f0;
    border: 1px dashed #bbb;
    height: 40px; /* Adjust to match list-item height */
  }
</style>
